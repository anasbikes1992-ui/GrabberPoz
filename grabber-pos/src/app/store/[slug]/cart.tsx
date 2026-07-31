"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { formatMoney } from "@/lib/format";
import { whatsAppLink, whatsAppOrderText } from "@/lib/storefront";

interface CartLine {
  productId: string;
  name: string;
  price: number;
  quantity: number;
}

interface CartState {
  lines: CartLine[];
  count: number;
  total: number;
  add: (line: Omit<CartLine, "quantity">) => void;
  setQuantity: (productId: string, quantity: number) => void;
  clear: () => void;
  open: () => void;
}

const CartCtx = createContext<CartState | null>(null);

export function useCart(): CartState {
  const ctx = useContext(CartCtx);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}

interface ProviderProps {
  slug: string;
  businessName: string;
  whatsappNumber: string | null;
  currency: string;
  children: React.ReactNode;
}

/** Fires a marketing event only if the tag actually loaded. */
function track(event: string, payload: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  const w = window as unknown as {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  };
  w.gtag?.("event", event, payload);
  w.fbq?.(
    "track",
    event === "add_to_cart" ? "AddToCart" : event === "purchase" ? "Purchase" : "ViewContent",
    payload,
  );
}

const STORAGE_KEY = "grabber-store-cart";

export function CartProvider({
  slug,
  businessName,
  whatsappNumber,
  currency,
  children,
}: ProviderProps) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  // Restore the cart once on mount, then persist every change.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(`${STORAGE_KEY}:${slug}`);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
    } catch {
      // A corrupt cart shouldn't stop someone shopping.
    }
    setHydrated(true);
  }, [slug]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(`${STORAGE_KEY}:${slug}`, JSON.stringify(lines));
    } catch {
      // Private browsing / quota — the cart just won't survive a reload.
    }
  }, [lines, slug, hydrated]);

  const add = useCallback((line: Omit<CartLine, "quantity">) => {
    setLines((prev) => {
      const existing = prev.find((l) => l.productId === line.productId);
      return existing
        ? prev.map((l) =>
            l.productId === line.productId ? { ...l, quantity: l.quantity + 1 } : l,
          )
        : [...prev, { ...line, quantity: 1 }];
    });
    setShowCart(true);
    track("add_to_cart", { currency, value: line.price, items: [{ item_name: line.name }] });
  }, [currency]);

  const setQuantity = useCallback((productId: string, quantity: number) => {
    setLines((prev) =>
      quantity <= 0
        ? prev.filter((l) => l.productId !== productId)
        : prev.map((l) => (l.productId === productId ? { ...l, quantity } : l)),
    );
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const total = useMemo(
    () => lines.reduce((sum, l) => sum + l.price * l.quantity, 0),
    [lines],
  );
  const count = useMemo(
    () => lines.reduce((sum, l) => sum + l.quantity, 0),
    [lines],
  );

  const value: CartState = {
    lines,
    count,
    total,
    add,
    setQuantity,
    clear,
    open: () => setShowCart(true),
  };

  return (
    <CartCtx.Provider value={value}>
      {children}
      {showCart && (
        <CartDrawer
          slug={slug}
          businessName={businessName}
          whatsappNumber={whatsappNumber}
          currency={currency}
          onClose={() => setShowCart(false)}
        />
      )}
    </CartCtx.Provider>
  );
}

export function CartButton() {
  const { count, open } = useCart();
  return (
    <button
      onClick={open}
      className="relative rounded-xl bg-sky-500 px-4 py-2 text-sm font-bold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
    >
      Cart
      {count > 0 && (
        <span className="ml-2 rounded-full bg-slate-950 px-2 py-0.5 text-xs font-extrabold text-sky-400">
          {count}
        </span>
      )}
    </button>
  );
}

export function AddToCartButton({
  productId,
  name,
  price,
  inStock,
}: {
  productId: string;
  name: string;
  price: number;
  inStock: boolean;
}) {
  const { add } = useCart();
  if (!inStock) {
    return (
      <span className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-500">
        Out of stock
      </span>
    );
  }
  return (
    <button
      onClick={() => add({ productId, name, price })}
      className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold text-slate-950 transition hover:bg-emerald-400"
    >
      Add
    </button>
  );
}

function CartDrawer({
  slug,
  businessName,
  whatsappNumber,
  currency,
  onClose,
}: {
  slug: string;
  businessName: string;
  whatsappNumber: string | null;
  currency: string;
  onClose: () => void;
}) {
  const { lines, total, setQuantity, clear } = useCart();
  const [step, setStep] = useState<"cart" | "details" | "done">("cart");
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [address, setAddress] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<string | null>(null);

  const waHref = whatsAppLink(
    whatsappNumber,
    whatsAppOrderText(businessName, lines, total, currency),
  );

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/store/${slug}/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName: name,
          customerMobile: mobile,
          address,
          clientUuid: crypto.randomUUID(),
          lines: lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Order could not be placed");

      track("purchase", { currency, value: total, transaction_id: json.data.receiptNo });
      setReceipt(json.data.receiptNo);
      clear();
      setStep("done");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Order could not be placed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
      <div className="flex h-full w-full max-w-md flex-col border-l border-slate-800 bg-slate-900">
        <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">
          <h1 className="font-bold text-slate-100">
            {step === "done" ? "Order placed" : "Your order"}
          </h1>
          <button
            onClick={onClose}
            aria-label="Close cart"
            className="rounded-lg px-2 py-1 text-slate-400 transition hover:text-slate-100"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {step === "done" ? (
            <div className="space-y-3 text-center">
              <p className="text-4xl">✅</p>
              <p className="font-semibold text-slate-100">Thank you, {name || "friend"}!</p>
              <p className="text-sm text-slate-400">
                Order <span className="font-mono text-emerald-400">{receipt}</span> is confirmed.
                We&apos;ll call {mobile} to arrange delivery. Payment is cash on delivery.
              </p>
            </div>
          ) : lines.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">Your cart is empty.</p>
          ) : (
            <ul className="space-y-3">
              {lines.map((l) => (
                <li
                  key={l.productId}
                  className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 p-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-200">{l.name}</p>
                    <p className="text-xs text-emerald-400">{formatMoney(l.price)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setQuantity(l.productId, l.quantity - 1)}
                      aria-label={`Reduce ${l.name}`}
                      className="h-7 w-7 rounded-lg border border-slate-700 text-slate-300"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-sm tabular-nums text-slate-100">
                      {l.quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(l.productId, l.quantity + 1)}
                      aria-label={`Add another ${l.name}`}
                      className="h-7 w-7 rounded-lg border border-slate-700 text-slate-300"
                    >
                      +
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}

          {step === "details" && (
            <form id="checkout" onSubmit={submit} className="mt-5 space-y-3">
              <input
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              />
              <input
                required
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                placeholder="Mobile number"
                inputMode="tel"
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              />
              <textarea
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Delivery address"
                rows={3}
                className="w-full rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-sm text-slate-100 outline-none focus:border-sky-500"
              />
              <p className="text-xs text-slate-500">
                Payment is <b className="text-slate-300">cash on delivery</b>.
              </p>
              {error && <p className="text-sm text-rose-400">{error}</p>}
            </form>
          )}
        </div>

        {step !== "done" && lines.length > 0 && (
          <div className="space-y-3 border-t border-slate-800 px-5 py-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-400">Total</span>
              <span className="text-lg font-bold text-emerald-400">{formatMoney(total)}</span>
            </div>

            {step === "cart" ? (
              <div className="space-y-2">
                <button
                  onClick={() => setStep("details")}
                  className="w-full rounded-xl bg-sky-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-sky-400"
                >
                  Checkout — cash on delivery
                </button>
                {waHref && (
                  <a
                    href={waHref}
                    target="_blank"
                    rel="noreferrer"
                    className="block w-full rounded-xl border border-emerald-500/40 bg-emerald-500/10 py-3 text-center text-sm font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                  >
                    Order on WhatsApp instead
                  </a>
                )}
              </div>
            ) : (
              <button
                form="checkout"
                type="submit"
                disabled={busy}
                className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-bold text-slate-950 transition hover:bg-emerald-400 disabled:opacity-50"
              >
                {busy ? "Placing order…" : "Place order"}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
