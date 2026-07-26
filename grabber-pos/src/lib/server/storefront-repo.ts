import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseEnabled } from "@/lib/supabase/config";
import { allProducts } from "./product-repo";
import { readSettings } from "./settings-store";
import { slugify, type StorefrontInfo, type StoreCatalog, type StoreProduct } from "@/lib/storefront";

/**
 * The single place the public storefront reads and writes.
 *
 * Durable backend: SECURITY DEFINER RPCs that resolve the organization from the
 * storefront's host or slug — never from the caller, who is anonymous. The
 * plain anon client is used deliberately: no session, no cookies, so responses
 * stay cacheable and no service-role key goes anywhere near a public page.
 *
 * Local backend: the bundled catalog, so `npm run dev` still serves a shop with
 * zero configuration.
 */
function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface StorefrontKey {
  host: string | null;
  slug: string | null;
}

// --- local/demo fallback ----------------------------------------------------

function localInfo(businessName: string): StorefrontInfo {
  return {
    slug: "main-store",
    domain: null,
    businessName,
    heroHeadline: businessName,
    heroSubline: "Shop online — fast local delivery",
    heroImageUrl: null,
    about: null,
    whatsappNumber: null,
    ga4Id: null,
    googleAdsId: null,
    metaPixelId: null,
  };
}

function toStoreProduct(p: ReturnType<typeof allProducts>[number]): StoreProduct {
  return {
    id: p.id,
    slug: slugify(p.name),
    name: p.name,
    nameLocal: p.nameLocal,
    description: null,
    brand: p.brand,
    price: p.salePrice,
    imageUrl: p.imageUrl ?? null,
    stock: p.quantity,
    category: p.category,
  };
}

// --- public API -------------------------------------------------------------

export async function getStorefrontInfo(key: StorefrontKey): Promise<StorefrontInfo | null> {
  if (!isSupabaseEnabled) {
    const settings = await readSettings();
    return localInfo(settings.businessName || "GRABBER POS Store");
  }

  const { data, error } = await anonClient().rpc("storefront_info", {
    p_host: key.host,
    p_slug: key.slug,
  });
  if (error) throw new Error(error.message);
  return (data as StorefrontInfo | null) ?? null;
}

export async function getStorefrontCatalog(
  key: StorefrontKey,
  q: { search?: string; category?: string; page?: number; size?: number } = {},
): Promise<StoreCatalog> {
  const page = Math.max(q.page ?? 1, 1);
  const size = Math.min(Math.max(q.size ?? 24, 1), 100);

  if (!isSupabaseEnabled) {
    const term = q.search?.trim().toLowerCase() ?? "";
    let items = allProducts().map(toStoreProduct);
    if (q.category) items = items.filter((p) => p.category === q.category);
    if (term) items = items.filter((p) => p.name.toLowerCase().includes(term));

    const counts = new Map<string, number>();
    for (const p of allProducts()) {
      counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    }
    return {
      items: items.slice((page - 1) * size, page * size),
      total: items.length,
      page,
      size,
      categories: [...counts.entries()]
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count),
    };
  }

  const { data, error } = await anonClient().rpc("storefront_catalog", {
    p_host: key.host,
    p_slug: key.slug,
    p_search: q.search ?? null,
    p_category: q.category ?? null,
    p_page: page,
    p_size: size,
  });
  if (error) throw new Error(error.message);
  return (
    (data as StoreCatalog | null) ?? {
      items: [],
      total: 0,
      page,
      size,
      categories: [],
    }
  );
}

export async function getStorefrontProduct(
  key: StorefrontKey,
  productSlug: string,
): Promise<StoreProduct | null> {
  if (!isSupabaseEnabled) {
    return allProducts().map(toStoreProduct).find((p) => p.slug === productSlug) ?? null;
  }

  const { data, error } = await anonClient().rpc("storefront_product", {
    p_host: key.host,
    p_slug: key.slug,
    p_product: productSlug,
  });
  if (error) throw new Error(error.message);
  return (data as StoreProduct | null) ?? null;
}

export async function getStorefrontProductSlugs(
  key: StorefrontKey,
): Promise<{ slug: string; updatedAt: string }[]> {
  if (!isSupabaseEnabled) {
    return allProducts().map((p) => ({
      slug: slugify(p.name),
      updatedAt: new Date().toISOString(),
    }));
  }

  const { data, error } = await anonClient().rpc("storefront_product_slugs", {
    p_host: key.host,
    p_slug: key.slug,
  });
  if (error) throw new Error(error.message);
  return ((data ?? []) as { slug: string; updated_at: string }[]).map((r) => ({
    slug: r.slug,
    updatedAt: r.updated_at,
  }));
}

export interface StoreOrderInput {
  customerName: string;
  customerMobile: string;
  address: string;
  clientUuid: string;
  lines: { productId: string; quantity: number }[];
}

export async function placeStorefrontOrder(
  key: StorefrontKey,
  input: StoreOrderInput,
): Promise<{ id: string; receiptNo: string; total: number }> {
  if (!isSupabaseEnabled) {
    throw new Error("Online ordering requires the durable backend");
  }

  const { data, error } = await anonClient().rpc("storefront_create_order", {
    p_host: key.host,
    p_slug: key.slug,
    p_payload: {
      customerName: input.customerName,
      customerMobile: input.customerMobile,
      clientUuid: input.clientUuid,
      lines: input.lines,
    },
  });
  if (error) throw new Error(error.message);

  const sale = data as { id: string; receipt_no?: string; total?: number } | null;
  if (!sale?.id) throw new Error("Order could not be placed");
  return {
    id: sale.id,
    receiptNo: sale.receipt_no ?? sale.id,
    total: Number(sale.total ?? 0),
  };
}
