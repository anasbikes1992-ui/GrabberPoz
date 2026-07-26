"use client";

import { useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { BillPanel } from "@/components/pos/BillPanel";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { useCartStore } from "@/lib/store/cart-store";

function PosWorkspace() {
  const params = useSearchParams();
  const addProduct = useCartStore((s) => s.addProduct);
  const isWholesale = useCartStore((s) => s.isWholesale);
  const setWholesale = useCartStore((s) => s.setWholesale);

  useEffect(() => {
    if (params.get("mode") === "wholesale") setWholesale(true);
  }, [params, setWholesale]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col px-5 py-4">
      <ModuleHeader
        title={isWholesale ? "Wholesale sale" : "Retail sale"}
        subtitle="Scan or search, build the bill, take payment"
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

      <div className="mt-4 flex min-h-0 flex-1 gap-5">
        <section className="min-w-0 flex-1" aria-label="Product catalog">
          <ProductGrid onPick={addProduct} />
        </section>
        <section className="w-96 shrink-0" aria-label="Bill">
          <BillPanel />
        </section>
      </div>
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
