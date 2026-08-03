import "server-only";
import { findById } from "@/lib/server/product-repo";
import { upsertOverride } from "@/lib/server/product-write-store";
import {
  dataFile,
  readJsonFile,
  writeJsonFile,
  withFileLock,
} from "./persistence/local-json";
import type { Sale } from "@/lib/types";
import { writeAudit } from "./audit-store";

const SALES_FILE = dataFile("sales.json");

/**
 * Complete a PENDING storefront/card sale after verified gateway webhook.
 * This is the ONLY path that flips pending → completed and decrements stock
 * for card/online payments (local backend).
 */
export async function completePendingSale(
  saleIdOrReceipt: string,
): Promise<Sale> {
  let completed: Sale | undefined;

  await withFileLock(SALES_FILE, async () => {
    const sales = await readJsonFile<Sale[]>(SALES_FILE, []);
    const idx = sales.findIndex(
      (s) =>
        s.id === saleIdOrReceipt ||
        (s as { receiptNo?: string }).receiptNo === saleIdOrReceipt,
    );
    if (idx < 0) throw new Error(`PENDING_SALE_NOT_FOUND:${saleIdOrReceipt}`);

    const existing = sales[idx]!;
    if (existing.status === "completed") {
      completed = existing;
      return;
    }
    if (existing.status === "voided") {
      throw new Error(`SALE_VOIDED:${saleIdOrReceipt}`);
    }
    if (existing.status !== "pending") {
      throw new Error(`SALE_NOT_PENDING:${saleIdOrReceipt}`);
    }

    const next: Sale = {
      ...existing,
      status: "completed",
    };
    sales[idx] = next;
    await writeJsonFile(SALES_FILE, sales);
    completed = next;
  });

  if (!completed) throw new Error(`PENDING_SALE_NOT_FOUND:${saleIdOrReceipt}`);
  const sale = completed;

  for (const line of sale.lines) {
    if (line.productId.startsWith("CUSTOM")) continue;
    const colon = line.productId.indexOf(":");
    const lookupId = colon > 0 ? line.productId.slice(0, colon) : line.productId;
    const product = findById(lookupId);
    if (!product) continue;
    const qty = Math.max(0, Number(product.quantity) - line.quantity);
    await upsertOverride({ ...product, quantity: qty });
  }

  try {
    const { recordSaleOnShift } = await import("@/lib/server/register-store");
    await recordSaleOnShift({
      id: sale.id,
      total: sale.total,
      paymentMethod: sale.paymentMethod,
      cashReceived: sale.cashReceived,
    });
  } catch {
    // No open shift — non-fatal for storefront
  }

  await writeAudit({
    actor: "payments-webhook",
    action: "sale.complete_pending",
    entity: "sale",
    entityId: sale.id,
    detail: "Gateway verified PAID",
  });

  return sale;
}
