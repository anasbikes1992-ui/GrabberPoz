"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, Sale } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { saleToTicketText } from "@/lib/receipt";
import { useDebounce } from "@/hooks/useDebounce";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

interface OrderLine {
  productId: string;
  name: string;
  unitPrice: number;
  quantity: number;
  sentQty: number;
}
interface Order {
  tableId: string;
  lines: OrderLine[];
}

export default function TableOrderPage() {
  const { tableId } = useParams<{ tableId: string }>();
  const router = useRouter();
  const [tableName, setTableName] = useState(tableId);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<string | null>(null);
  const [payOpen, setPayOpen] = useState(false);
  const [cash, setCash] = useState("");
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState<Sale | null>(null);

  const load = useCallback(() => {
    fetch(`/api/restaurant/orders/${tableId}`)
      .then((r) => r.json())
      .then((j) => j.success && setOrder(j.data))
      .catch(() => undefined);
  }, [tableId]);

  useEffect(() => {
    load();
    fetch("/api/collections/tables")
      .then((r) => r.json())
      .then((j) => {
        if (j.success) {
          const t = j.data.find((x: { id: string }) => x.id === tableId);
          if (t?.name) setTableName(t.name);
        }
      })
      .catch(() => undefined);
  }, [tableId, load]);

  async function act(action: string, extra: Record<string, unknown> = {}) {
    const res = await fetch(`/api/restaurant/orders/${tableId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, ...extra }),
    });
    return res.json();
  }

  async function addItem(p: Product) {
    const j = await act("addItem", { productId: p.id });
    if (j.success) setOrder(j.data);
  }
  async function setQty(productId: string, quantity: number) {
    const j = await act("setQty", { productId, quantity });
    if (j.success) setOrder(j.data);
  }
  async function send(station: "KOT" | "BOT") {
    setStatus("Sending…");
    const j = await act("send", { station });
    if (j.success) {
      setOrder(j.data.order);
      const printed = j.data.printed
        ? `printed to ${station}`
        : `${station}: ${j.data.printMessage}`;
      setStatus(`Sent ${j.data.sent.length} item(s) — ${printed}`);
    } else {
      setStatus(j.error ?? "Nothing to send");
    }
  }
  async function settle() {
    setPending(true);
    const j = await act("settle", {
      paymentMethod: "cash",
      cashReceived: Number(cash) || total,
    });
    setPending(false);
    if (j.success) {
      setDone(j.data as Sale);
      setOrder(null);
    } else {
      setStatus(j.error ?? "Settle failed");
    }
  }

  async function printReceipt(sale: Sale) {
    await fetch("/api/print", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ station: "RECEIPT", content: saleToTicketText(sale) }),
    }).catch(() => undefined);
  }

  const lines = order?.lines ?? [];
  const total = lines.reduce((s, l) => s + l.unitPrice * l.quantity, 0);
  const newItems = lines.reduce((s, l) => s + (l.quantity - l.sentQty), 0);

  if (done) {
    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl text-accent">
          ✓
        </div>
        <h1 className="mt-4 text-lg font-semibold text-text-strong">
          {done.id} settled
        </h1>
        <p className="mt-1 text-3xl font-bold text-accent">
          {formatMoney(done.total)}
        </p>
        {done.change != null && done.change > 0 && (
          <p className="mt-1 text-sm text-text-dim">
            Change: {formatMoney(done.change)}
          </p>
        )}
        <div className="mt-8 flex gap-3">
          <button
            onClick={() => printReceipt(done)}
            className="flex-1 rounded-lg border border-line py-2.5 text-sm text-text-body transition hover:border-accent hover:text-accent"
          >
            Print receipt
          </button>
          <button
            onClick={() => router.push("/restaurant")}
            className="flex-1 rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong"
          >
            Back to floor
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-3.5rem)] max-w-6xl flex-col px-6 py-6">
      <ModuleHeader
        title={`Table ${tableName}`}
        subtitle={
          newItems > 0 ? `${newItems} item(s) not sent` : "All items sent"
        }
      />

      <div className="mt-4 flex min-h-0 flex-1 gap-5">
        <section className="min-w-0 flex-1">
          <ProductPicker onPick={addItem} />
        </section>

        <section className="flex w-96 shrink-0 flex-col rounded-xl border border-line bg-surface-1">
          <div className="border-b border-line px-5 py-3.5">
            <h2 className="font-semibold text-text-strong">Order</h2>
          </div>
          <div className="flex-1 overflow-y-auto px-4 py-3">
            {lines.length === 0 ? (
              <p className="mt-10 text-center text-sm text-text-dim">
                Add items from the left.
              </p>
            ) : (
              <AnimatePresence initial={false}>
                {lines.map((l) => (
                  <motion.div
                    key={l.productId}
                    layout
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 16 }}
                    className="mb-2 rounded-lg border border-line bg-surface-2 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-text-strong">
                        {l.name}
                        {l.quantity > l.sentQty && (
                          <span className="ml-2 rounded-full bg-warn/15 px-1.5 py-0.5 text-[10px] text-warn">
                            +{l.quantity - l.sentQty} new
                          </span>
                        )}
                      </p>
                      <p className="text-sm font-semibold text-accent">
                        {formatMoney(l.unitPrice * l.quantity)}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center gap-1">
                      <StepBtn label="−" onClick={() => setQty(l.productId, l.quantity - 1)} />
                      <span className="w-8 text-center text-sm font-semibold text-text-strong">
                        {l.quantity}
                      </span>
                      <StepBtn label="+" onClick={() => setQty(l.productId, l.quantity + 1)} />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          <div className="space-y-2 border-t border-line px-5 py-4">
            {status && <p className="text-xs text-text-dim">{status}</p>}
            <div className="flex items-center justify-between">
              <p className="font-semibold text-text-strong">Total</p>
              <p className="text-xl font-bold text-accent">{formatMoney(total)}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => send("KOT")}
                disabled={newItems === 0}
                className="rounded-lg border border-line py-2 text-sm text-text-body transition hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Send Kitchen
              </button>
              <button
                onClick={() => send("BOT")}
                disabled={newItems === 0}
                className="rounded-lg border border-line py-2 text-sm text-text-body transition hover:border-accent hover:text-accent disabled:opacity-40"
              >
                Send Bar
              </button>
            </div>
            {payOpen ? (
              <div className="space-y-2">
                <input
                  type="number"
                  value={cash}
                  onChange={(e) => setCash(e.target.value)}
                  placeholder="Cash received"
                  className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text-strong outline-none focus:border-accent"
                />
                <button
                  onClick={settle}
                  disabled={pending || lines.length === 0}
                  className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong disabled:opacity-50"
                >
                  {pending ? "Settling…" : `Confirm ${formatMoney(total)}`}
                </button>
              </div>
            ) : (
              <button
                onClick={() => setPayOpen(true)}
                disabled={lines.length === 0}
                className="w-full rounded-lg bg-accent py-2.5 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong disabled:opacity-40"
              >
                Settle &amp; pay
              </button>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

function StepBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="h-7 w-7 rounded-md border border-line bg-surface-1 text-text-body transition hover:border-accent hover:text-accent"
    >
      {label}
    </button>
  );
}

function ProductPicker({ onPick }: { onPick: (p: Product) => void }) {
  const [q, setQ] = useState("");
  const [items, setItems] = useState<Product[]>([]);
  const debounced = useDebounce(q, 200);

  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ pageSize: "24" });
    if (debounced.trim()) params.set("search", debounced.trim());
    fetch(`/api/products?${params}`, { signal: controller.signal })
      .then((r) => r.json())
      .then((j) => j.success && setItems(j.data.items))
      .catch(() => undefined);
    return () => controller.abort();
  }, [debounced]);

  return (
    <div className="flex h-full flex-col">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search menu items…"
        className="w-full rounded-lg border border-line bg-surface-1 px-4 py-2.5 text-sm text-text-strong outline-none transition focus:border-accent"
      />
      <div className="mt-3 flex-1 overflow-y-auto pr-1">
        <div className="grid grid-cols-2 gap-2 md:grid-cols-3">
          {items.map((p) => (
            <button
              key={p.id}
              onClick={() => onPick(p)}
              className="flex flex-col justify-between rounded-xl border border-line bg-surface-1 p-3 text-left transition hover:border-accent/60"
            >
              <p className="line-clamp-2 text-sm font-medium text-text-strong">
                {p.name}
              </p>
              <p className="mt-2 font-semibold text-accent">
                {formatMoney(p.salePrice)}
              </p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
