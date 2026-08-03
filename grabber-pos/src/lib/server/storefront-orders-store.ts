import "server-only";
import { randomUUID } from "crypto";
import { recordStore } from "./persistence/record-store";
import type { PaymentMode, FulfilmentMode } from "@/lib/website";
import { isSupabaseEnabled } from "@/lib/supabase/config";

export interface StorefrontOrderLine {
  productId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

export interface StorefrontWebOrder {
  id: string;
  receiptNo: string;
  saleId: string | null;
  slug: string;
  customerName: string;
  customerMobile: string;
  customerEmail: string | null;
  customerId: string | null;
  address: string;
  pickupNote: string;
  paymentMethod: PaymentMode;
  paymentReference: string;
  fulfilment: FulfilmentMode;
  lines: StorefrontOrderLine[];
  total: number;
  boardId: string | null;
  boardKind: "click-collect" | "delivery" | null;
  /** True when card checkout is waiting for gateway webhook. */
  pendingPayment?: boolean;
  createdAt: string;
}

const store = recordStore<StorefrontWebOrder>({
  collection: "storefront-orders",
  file: "storefront-orders.json",
});

export async function saveStorefrontWebOrder(
  order: Omit<StorefrontWebOrder, "id" | "createdAt"> & {
    id?: string;
    createdAt?: string;
  },
): Promise<StorefrontWebOrder> {
  const row: StorefrontWebOrder = {
    ...order,
    id: order.id ?? `WEB-${randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: order.createdAt ?? new Date().toISOString(),
  };
  return store.put(row);
}

export async function listStorefrontOrdersByCustomer(opts: {
  slug: string;
  customerEmail?: string | null;
  customerId?: string | null;
  customerMobile?: string | null;
}): Promise<StorefrontWebOrder[]> {
  const all = await store.list();
  return all
    .filter((o) => {
      if (o.slug !== opts.slug) return false;
      if (opts.customerId && o.customerId === opts.customerId) return true;
      if (
        opts.customerEmail &&
        o.customerEmail &&
        o.customerEmail.toLowerCase() === opts.customerEmail.toLowerCase()
      ) {
        return true;
      }
      if (
        opts.customerMobile &&
        o.customerMobile &&
        digits(o.customerMobile) === digits(opts.customerMobile)
      ) {
        return true;
      }
      return false;
    })
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function digits(v: string): string {
  return v.replace(/\D/g, "");
}

export async function findStorefrontOrderBySaleOrReceipt(
  saleId: string,
  receiptNo?: string,
): Promise<StorefrontWebOrder | null> {
  const match = (o: StorefrontWebOrder) =>
    o.saleId === saleId ||
    o.receiptNo === receiptNo ||
    o.receiptNo === saleId ||
    o.id === saleId;

  // Webhooks have no user session — use service role when Supabase is on.
  if (isSupabaseEnabled && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    try {
      const { createServiceSupabase } = await import("@/lib/supabase/server");
      const db = createServiceSupabase();
      const { data, error } = await db
        .from("app_collections")
        .select("data")
        .eq("collection", "storefront-orders")
        .limit(200);
      if (!error && data) {
        for (const row of data) {
          const o = row.data as unknown as StorefrontWebOrder;
          if (o && match(o)) return o;
        }
      }
    } catch {
      // fall through to session/local store
    }
  }

  const all = await store.list();
  return all.find(match) ?? null;
}

export async function updateStorefrontWebOrder(
  id: string,
  patch: Partial<StorefrontWebOrder>,
): Promise<StorefrontWebOrder | null> {
  const all = await store.list();
  const existing = all.find((o) => o.id === id);
  if (!existing) return null;
  const next = { ...existing, ...patch };
  return store.put(next);
}
