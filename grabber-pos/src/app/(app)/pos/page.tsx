"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { BillPanel } from "@/components/pos/BillPanel";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { Button } from "@/components/ui/Button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatMoney } from "@/lib/format";
import type { Product } from "@/lib/types";

interface VariantRow {
  id: string;
  productId: string;
  name: string;
  sku: string;
  price: number;
  quantity: number;
  barcode?: string;
}

function PosWorkspace() {
  const params = useSearchParams();
  const addProduct = useCartStore((s) => s.addProduct);
  const addCustomLine = useCartStore((s) => s.addCustomLine);
  const setCustomerName = useCartStore((s) => s.setCustomerName);
  const isWholesale = useCartStore((s) => s.isWholesale);
  const setWholesale = useCartStore((s) => s.setWholesale);
  const categoryMode = params.get("mode") === "category";

  const [variantPick, setVariantPick] = useState<{
    product: Product;
    variants: VariantRow[];
  } | null>(null);
  const [selectedSku, setSelectedSku] = useState("");

  useEffect(() => {
    if (params.get("mode") === "wholesale") setWholesale(true);
  }, [params, setWholesale]);

  // Quotation → sale deep link: /pos?customer=...&amount=...
  useEffect(() => {
    const customer = params.get("customer");
    const amount = params.get("amount");
    const quote = params.get("quote");
    if (customer) setCustomerName(customer);
    if (amount && !Number.isNaN(Number(amount)) && Number(amount) > 0) {
      addCustomLine({
        name: quote ? "Quotation amount" : "Quoted amount",
        unitPrice: Number(amount),
      });
    }
    // Only apply once on mount from URL
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handlePick(product: Product) {
    try {
      const res = await fetch("/api/collections/variants");
      const json = await res.json();
      const all = (json.success ? json.data : []) as VariantRow[];
      const variants = all.filter(
        (v) => String(v.productId) === String(product.id),
      );
      if (variants.length === 0) {
        addProduct(product);
        return;
      }
      setSelectedSku(variants[0]?.sku ?? "");
      setVariantPick({ product, variants });
    } catch {
      addProduct(product);
    }
  }

  function confirmVariant() {
    if (!variantPick) return;
    const v = variantPick.variants.find((x) => x.sku === selectedSku);
    if (!v) return;
    const p = variantPick.product;
    addProduct({
      ...p,
      id: `${p.id}:${v.sku}`,
      name: `${p.name} — ${v.name}`,
      salePrice: Number(v.price) || 0,
      quantity: Number(v.quantity) || 0,
      barcodes: v.barcode
        ? [v.barcode, ...(p.barcodes ?? [])]
        : p.barcodes,
    });
    setVariantPick(null);
  }

  return (
    <div className="relative flex h-[calc(100vh-3.5rem)] flex-col px-5 py-4">
      <ModuleHeader
        title={
          categoryMode
            ? "Category sale"
            : isWholesale
              ? "Wholesale sale"
              : "Retail sale"
        }
        subtitle={
          categoryMode
            ? "Browse by category — tap products to add"
            : "Scan or search, build the bill, take payment"
        }
        actions={
          <div className="flex items-center gap-2 rounded-lg border border-line px-3 py-1.5 text-sm">
            <span className={isWholesale ? "text-text-dim" : "text-accent"}>
              Retail
            </span>
            <button
              role="switch"
              aria-checked={isWholesale}
              aria-label="Toggle wholesale pricing"
              onClick={() => setWholesale(!isWholesale)}
              className={`relative h-5 w-9 rounded-full transition ${
                isWholesale ? "bg-accent" : "bg-surface-3"
              }`}
            >
              <span
                className={`absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all ${
                  isWholesale ? "left-[18px]" : "left-0.5"
                }`}
              />
            </button>
            <span className={isWholesale ? "text-accent" : "text-text-dim"}>
              Wholesale
            </span>
          </div>
        }
      />

      {categoryMode && (
        <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-accent">
          Category mode — browse chips below; barcode scanning is secondary.
        </div>
      )}

      <div className="mt-4 flex min-h-0 flex-1 flex-col gap-5 lg:flex-row">
        <section className="min-h-0 min-w-0 flex-1" aria-label="Product catalog">
          <ProductGrid onPick={handlePick} categoryMode={categoryMode} />
        </section>
        <section
          className="flex min-h-[28rem] w-full shrink-0 flex-col lg:sticky lg:top-4 lg:h-auto lg:min-h-0 lg:w-[26rem] lg:self-stretch"
          aria-label="Bill"
        >
          <BillPanel />
        </section>
      </div>

      {variantPick && (
        <div
          className="absolute inset-0 z-40 flex items-center justify-center bg-black/50 p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Select variant"
        >
          <div className="w-full max-w-sm rounded-xl border border-line bg-surface-1 p-5 shadow-xl">
            <h3 className="text-sm font-semibold text-text-strong">
              Select variant
            </h3>
            <p className="mt-1 text-xs text-text-dim">{variantPick.product.name}</p>
            <label className="mt-4 block text-sm">
              <span className="mb-1 block text-text-dim">Variant / SKU</span>
              <select
                value={selectedSku}
                onChange={(e) => setSelectedSku(e.target.value)}
                className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-text-strong outline-none focus:border-accent"
                autoFocus
              >
                {variantPick.variants.map((v) => (
                  <option key={v.sku} value={v.sku}>
                    {v.name} · {v.sku} · {formatMoney(Number(v.price) || 0)}
                    {` · ${v.quantity} left`}
                  </option>
                ))}
              </select>
            </label>
            <div className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setVariantPick(null)}
              >
                Cancel
              </Button>
              <Button type="button" onClick={confirmVariant}>
                Add to bill
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function PosPage() {
  return (
    <Suspense fallback={<div className="p-8 text-text-dim">Loading…</div>}>
      <PosWorkspace />
    </Suspense>
  );
}
