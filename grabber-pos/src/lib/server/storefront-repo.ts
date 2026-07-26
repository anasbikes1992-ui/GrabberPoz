import "server-only";
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_URL, SUPABASE_ANON_KEY, isSupabaseEnabled } from "@/lib/supabase/config";
import { getRepository } from "@/lib/server/repositories";
import { readSettings } from "./settings-store";
import { slugify, type StorefrontInfo, type StoreCatalog, type StoreProduct } from "@/lib/storefront";

function anonClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export interface StorefrontKey {
  host: string | null;
  slug: string | null;
}

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

export async function getStorefrontInfo(key: StorefrontKey): Promise<StorefrontInfo | null> {
  const settings = await readSettings();
  const defaultInfo = localInfo(settings.businessName || "GRABBER POS Store");

  if (!isSupabaseEnabled) {
    return defaultInfo;
  }

  try {
    const { data, error } = await anonClient().rpc("storefront_info", {
      p_host: key.host,
      p_slug: key.slug,
    });
    if (error || !data) {
      return defaultInfo;
    }
    return (data as StorefrontInfo) ?? defaultInfo;
  } catch {
    return defaultInfo;
  }
}

export async function getStorefrontCatalog(
  key: StorefrontKey,
  q: { search?: string; category?: string; page?: number; size?: number } = {},
): Promise<StoreCatalog> {
  const page = Math.max(q.page ?? 1, 1);
  const size = Math.min(Math.max(q.size ?? 24, 1), 100);

  const fallbackCatalog = async (): Promise<StoreCatalog> => {
    const repo = await getRepository();
    const pPage = await repo.queryProducts({ pageSize: size, page, search: q.search, category: q.category });
    return {
      items: pPage.items.map((p) => ({
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
      })),
      total: pPage.total,
      page,
      size,
      categories: pPage.categories,
    };
  };

  if (!isSupabaseEnabled) {
    return fallbackCatalog();
  }

  try {
    const { data, error } = await anonClient().rpc("storefront_catalog", {
      p_host: key.host,
      p_slug: key.slug,
      p_search: q.search ?? null,
      p_category: q.category ?? null,
      p_page: page,
      p_size: size,
    });
    if (error || !data) {
      return fallbackCatalog();
    }
    return data as StoreCatalog;
  } catch {
    return fallbackCatalog();
  }
}

export async function getStorefrontProduct(
  key: StorefrontKey,
  productSlug: string,
): Promise<StoreProduct | null> {
  const fallbackProduct = async (): Promise<StoreProduct | null> => {
    const repo = await getRepository();
    const pPage = await repo.queryProducts({ pageSize: 100 });
    const match = pPage.items.find((p) => slugify(p.name) === productSlug);
    if (!match) return null;
    return {
      id: match.id,
      slug: slugify(match.name),
      name: match.name,
      nameLocal: match.nameLocal,
      description: null,
      brand: match.brand,
      price: match.salePrice,
      imageUrl: match.imageUrl ?? null,
      stock: match.quantity,
      category: match.category,
    };
  };

  if (!isSupabaseEnabled) {
    return fallbackProduct();
  }

  try {
    const { data, error } = await anonClient().rpc("storefront_product", {
      p_host: key.host,
      p_slug: key.slug,
      p_product: productSlug,
    });
    if (error || !data) {
      return fallbackProduct();
    }
    return data as StoreProduct;
  } catch {
    return fallbackProduct();
  }
}

export async function getStorefrontProductSlugs(
  key: StorefrontKey,
): Promise<{ slug: string; updatedAt: string }[]> {
  const repo = await getRepository();
  const page = await repo.queryProducts({ pageSize: 500 });
  return page.items.map((p) => ({
    slug: slugify(p.name),
    updatedAt: new Date().toISOString(),
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
    const repo = await getRepository();
    const sale = await repo.createSale({
      paymentMethod: "cash",
      lines: input.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, discount: 0 })),
      customerName: input.customerName,
      customerMobile: input.customerMobile,
    });
    return { id: sale.id, receiptNo: sale.id, total: sale.total };
  }

  try {
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
    if (error || !data) {
      const repo = await getRepository();
      const sale = await repo.createSale({
        paymentMethod: "cash",
        lines: input.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, discount: 0 })),
        customerName: input.customerName,
        customerMobile: input.customerMobile,
      });
      return { id: sale.id, receiptNo: sale.id, total: sale.total };
    }
    const sale = data as { id: string; receipt_no?: string; total?: number };
    return {
      id: sale.id,
      receiptNo: sale.receipt_no ?? sale.id,
      total: Number(sale.total ?? 0),
    };
  } catch {
    const repo = await getRepository();
    const sale = await repo.createSale({
      paymentMethod: "cash",
      lines: input.lines.map((l) => ({ productId: l.productId, quantity: l.quantity, discount: 0 })),
      customerName: input.customerName,
      customerMobile: input.customerMobile,
    });
    return { id: sale.id, receiptNo: sale.id, total: sale.total };
  }
}
