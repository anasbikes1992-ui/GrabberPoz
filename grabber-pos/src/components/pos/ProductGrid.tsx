"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { useDebounce } from "@/hooks/useDebounce";

interface ProductGridProps {
  onPick: (product: Product) => void;
}

interface CategoryInfo {
  name: string;
  count: number;
}

const SEARCH_DEBOUNCE_MS = 220;
const TOP_CATEGORIES = 12;

export function ProductGrid({ onPick }: ProductGridProps) {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string | null>(null);
  const [items, setItems] = useState<Product[]>([]);
  const [categories, setCategories] = useState<CategoryInfo[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const debouncedSearch = useDebounce(search, SEARCH_DEBOUNCE_MS);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams();
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (category) params.set("category", category);
    setLoading(true);
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((json) => {
        if (!json.success) return;
        setItems(json.data.items);
        setCategories(json.data.categories);
        setTotal(json.data.total);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [debouncedSearch, category]);

  /** Barcode scanners type + Enter: exact match adds instantly. */
  async function handleEnter() {
    const code = search.trim();
    if (!code) return;
    const res = await fetch(`/api/products?barcode=${encodeURIComponent(code)}`);
    const json = await res.json();
    if (json.success && json.data) {
      onPick(json.data as Product);
      setSearch("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="flex h-full flex-col">
      <input
        ref={inputRef}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleEnter()}
        placeholder="Scan barcode or search name / brand…"
        autoFocus
        className="w-full rounded-xl border border-line bg-surface-1 px-5 py-3.5 text-text-strong outline-none transition focus:border-accent"
      />

      <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
        <CategoryChip
          label={`All (${total})`}
          active={category === null}
          onClick={() => setCategory(null)}
        />
        {categories.slice(0, TOP_CATEGORIES).map((c) => (
          <CategoryChip
            key={c.name}
            label={`${c.name} (${c.count})`}
            active={category === c.name}
            onClick={() => setCategory(category === c.name ? null : c.name)}
          />
        ))}
      </div>

      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        {loading && items.length === 0 ? (
          <p className="mt-10 text-center text-sm text-text-dim">Loading…</p>
        ) : (
          <motion.div layout className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
            <AnimatePresence mode="popLayout">
              {items.map((p) => (
                <motion.button
                  key={p.id}
                  layout
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ duration: 0.18 }}
                  whileHover={{ y: -3 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => onPick(p)}
                  className="flex flex-col justify-between rounded-xl border border-line bg-surface-1 p-3.5 text-left transition-colors hover:border-accent/60"
                >
                  <p className="line-clamp-2 text-sm font-medium text-text-strong">
                    {p.name}
                  </p>
                  <div className="mt-3 flex items-end justify-between">
                    <p className="font-semibold text-accent">
                      {formatMoney(p.salePrice)}
                    </p>
                    <p
                      className={`text-xs ${
                        p.quantity <= 5 ? "text-warn" : "text-text-dim"
                      }`}
                    >
                      {p.quantity} left
                    </p>
                  </div>
                </motion.button>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
        {!loading && items.length === 0 && (
          <p className="mt-10 text-center text-sm text-text-dim">
            No products match your search.
          </p>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 rounded-full border px-3.5 py-1.5 text-xs transition ${
        active
          ? "border-accent bg-accent text-accent-ink font-semibold"
          : "border-line bg-surface-1 text-text-dim hover:text-text-body"
      }`}
    >
      {label}
    </button>
  );
}
