import "server-only";
import {
  queryProducts,
  findByBarcode,
  findById,
  inventoryStats,
} from "@/lib/server/product-repo";
import {
  listSales,
  createSale as persistSale,
  salesStats,
} from "@/lib/server/sales-repo";
import type { Sale, SaleLine } from "@/lib/types";
import type {
  PosRepository,
  ProductQuery,
  ProductPage,
  CreateSaleInput,
  InventoryStats,
  SalesStats,
} from "./types";

/**
 * Zero-config repository over the bundled JSON store.
 * Mirrors the server-side validation the Supabase RPC performs, so the
 * business rules are identical regardless of backend.
 */
export class LocalRepository implements PosRepository {
  async queryProducts(q: ProductQuery): Promise<ProductPage> {
    return queryProducts(q);
  }

  async findByBarcode(code: string) {
    return findByBarcode(code) ?? null;
  }

  async inventoryStats(): Promise<InventoryStats> {
    return inventoryStats();
  }

  async listSales(limit = 100): Promise<Sale[]> {
    return listSales(limit);
  }

  async salesStats(): Promise<SalesStats> {
    return salesStats();
  }

  async createSale(input: CreateSaleInput): Promise<Sale> {
    if (!input.lines?.length) throw new Error("Sale must contain a line");

    const useWholesale =
      !!input.isWholesale || input.paymentMethod === "wholesale";

    const lines: SaleLine[] = [];
    for (const l of input.lines) {
      const product = findById(l.productId);
      if (!product) throw new Error(`Unknown product: ${l.productId}`);
      if (!Number.isInteger(l.quantity) || l.quantity <= 0) {
        throw new Error(`Invalid quantity for ${product.name}`);
      }
      const discount = Number(l.discount) || 0;
      if (discount < 0 || discount > product.maxDiscount) {
        throw new Error(
          `Discount for ${product.name} exceeds max (${product.maxDiscount})`,
        );
      }
      const unitPrice =
        useWholesale && product.wholesalePrice
          ? product.wholesalePrice
          : product.salePrice;
      lines.push({
        productId: product.id,
        name: product.name,
        unitPrice,
        quantity: l.quantity,
        discount,
        lineTotal: (unitPrice - discount) * l.quantity,
      });
    }

    const subtotal = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
    const discountTotal = lines.reduce((s, l) => s + l.discount * l.quantity, 0);
    const serviceCharge = Math.max(0, Number(input.serviceCharge) || 0);
    const finalDiscount = Math.max(0, Number(input.finalDiscount) || 0);
    const afterLines = subtotal - discountTotal;
    if (finalDiscount > afterLines) {
      throw new Error("Final discount exceeds the bill total");
    }
    const total = afterLines - finalDiscount + serviceCharge;

    const cashReceived =
      input.paymentMethod === "cash" ? Number(input.cashReceived) || 0 : null;
    if (input.paymentMethod === "cash" && (cashReceived ?? 0) < total) {
      throw new Error("Cash received is less than the total");
    }

    return persistSale({
      lines,
      subtotal,
      discountTotal,
      finalDiscount,
      serviceCharge,
      total,
      paymentMethod: input.paymentMethod,
      isWholesale: input.paymentMethod === "wholesale" || !!input.isWholesale,
      customerName: input.customerName?.trim() || null,
      customerMobile: input.customerMobile?.trim() || null,
      employee: input.employee?.trim() || null,
      cashReceived,
      change: cashReceived != null ? cashReceived - total : null,
    });
  }
}
