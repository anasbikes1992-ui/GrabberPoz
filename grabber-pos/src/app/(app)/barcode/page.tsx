"use client";

import { useEffect, useState } from "react";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";
import { ModuleHeader } from "@/components/shell/ModuleHeader";
import { Barcode } from "@/components/barcode/Barcode";

interface LabelItem {
  product: Product;
  count: number;
}

export default function BarcodePage() {
  const [items, setItems] = useState<LabelItem[]>([]);
  const [showName, setShowName] = useState(true);
  const [showPrice, setShowPrice] = useState(true);

  function addProduct(p: Product) {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === p.id);
      if (existing) return prev;
      return [...prev, { product: p, count: 1 }];
    });
  }
  function setCount(id: string, count: number) {
    setItems((prev) =>
      prev.map((i) =>
        i.product.id === id ? { ...i, count: Math.max(1, count) } : i,
      ),
    );
  }
  function remove(id: string) {
    setItems((prev) => prev.filter((i) => i.product.id !== id));
  }

  const labels = items.flatMap((i) =>
    Array.from({ length: i.count }, () => i.product),
  );

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <div className="print:hidden">
        <ModuleHeader
          title="Barcode labels"
          subtitle="Design and print product barcode labels"
          actions={
            <button
              onClick={() => window.print()}
              disabled={labels.length === 0}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong disabled:opacity-40"
            >
              Print {labels.length > 0 ? `(${labels.length})` : ""}
            </button>
          }
        />

        <ProductPicker onPick={addProduct} />

        <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-text-dim">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showName}
              onChange={(e) => setShowName(e.target.checked)}
            />
            Show name
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={showPrice}
              onChange={(e) => setShowPrice(e.target.checked)}
            />
            Show price
          </label>
        </div>

        {items.length > 0 && (
          <div className="mt-4 space-y-2">
            {items.map((i) => (
              <div
                key={i.product.id}
                className="flex items-center justify-between rounded-lg border border-line bg-surface-1 px-4 py-2.5 text-sm"
              >
                <span className="text-text-strong">{i.product.name}</span>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-2 text-text-dim">
                    Labels
                    <input
                      type="number"
                      min={1}
                      value={i.count}
                      onChange={(e) =>
                        setCount(i.product.id, Number(e.target.value) || 1)
                      }
                      className="w-16 rounded border border-line bg-surface-2 px-2 py-1 text-text-strong outline-none focus:border-accent"
                    />
                  </label>
                  <button
                    onClick={() => remove(i.product.id)}
                    className="text-text-dim transition hover:text-danger"
                    aria-label="Remove"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Print sheet */}
      {labels.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-dim print:hidden">
          Add products above to build a label sheet.
        </p>
      ) : (
        <div className="label-sheet mt-6 grid grid-cols-3 gap-2 sm:grid-cols-4 print:grid-cols-4">
          {labels.map((p, idx) => (
            <div
              key={p.id + idx}
              className="label flex flex-col items-center justify-center rounded border border-line bg-white p-2 text-center text-black"
            >
              {showName && (
                <p className="line-clamp-1 w-full text-[10px] font-medium">
                  {p.name}
                </p>
              )}
              <Barcode value={p.barcodes[0] || p.id} />
              {showPrice && (
                <p className="text-xs font-semibold">
                  {formatMoney(p.salePrice)}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProductPicker({ onPick }: { onPick: (p: Product) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<Product[]>([]);
  const debounced = useDebounce(q, 200);

  useEffect(() => {
    if (!debounced.trim()) {
      setResults([]);
      return;
    }
    const controller = new AbortController();
    fetch(`/api/products?search=${encodeURIComponent(debounced)}&pageSize=8`, {
      signal: controller.signal,
    })
      .then((r) => r.json())
      .then((j) => j.success && setResults(j.data.items))
      .catch(() => undefined);
    return () => controller.abort();
  }, [debounced]);

  return (
    <div className="relative mt-6">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search a product to add labels…"
        className="w-full rounded-lg border border-line bg-surface-1 px-4 py-2.5 text-sm text-text-strong outline-none transition focus:border-accent"
      />
      {results.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-line bg-surface-2 shadow-xl">
          {results.map((p) => (
            <li key={p.id}>
              <button
                onClick={() => {
                  onPick(p);
                  setQ("");
                  setResults([]);
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-sm transition hover:bg-surface-3"
              >
                <span className="text-text-strong">{p.name}</span>
                <span className="text-xs text-text-dim">
                  {p.barcodes[0] || p.id}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
