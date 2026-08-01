import "server-only";
import { randomUUID } from "crypto";
import { recordStore } from "./persistence/record-store";

export type ClickCollectStatus = "pending" | "picked" | "ready" | "collected";

export interface ClickCollectOrder {
  id: string;
  customer: string;
  phone: string;
  items: string;
  status: ClickCollectStatus;
  note: string;
  createdAt: string;
}

const store = recordStore<ClickCollectOrder>({
  collection: "click-collect-orders",
  file: "click-collect-orders.json",
});

export async function listClickCollect(): Promise<ClickCollectOrder[]> {
  return (await store.list()).sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export async function createClickCollect(input: {
  customer: string;
  phone?: string;
  items: string;
  note?: string;
}): Promise<ClickCollectOrder> {
  const order: ClickCollectOrder = {
    id: "CC-" + randomUUID().slice(0, 8).toUpperCase(),
    customer: input.customer.trim(),
    phone: input.phone?.trim() ?? "",
    items: input.items.trim(),
    status: "pending",
    note: input.note?.trim() ?? "",
    createdAt: new Date().toISOString(),
  };
  return store.put(order);
}

export async function patchClickCollect(
  id: string,
  status: ClickCollectStatus,
): Promise<ClickCollectOrder | null> {
  const current = await store.get(id);
  if (!current) return null;
  return store.put({ ...current, status });
}
