"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  useCartStore,
  cartTotals,
  effectivePrice,
} from "@/lib/store/cart-store";
import { formatMoney } from "@/lib/format";
import { saleToTicketText } from "@/lib/receipt";
import { CustomerPicker } from "@/components/pos/CustomerPicker";
import type { PaymentMethod, Sale } from "@/lib/types";

const PAYMENT_METHODS: { id: PaymentMethod; label: string }[] = [
  { id: "cash", label: "Cash" },
  { id: "card", label: "Card" },
];

export function BillPanel() {
  const store = useCartStore();
  const totals = cartTotals(store);
  const [method, setMethod] = useState<PaymentMethod>("cash");
  const [customerPaid, setCustomerPaid] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<Sale | null>(null);
  const [waStatus, setWaStatus] = useState<string | null>(null);
  const [receiptStatus, setReceiptStatus] = useState<string | null>(null);
  const [loyalty, setLoyalty] = useState({ perCurrency: 100, value: 1 });
  const [earnedMsg, setEarnedMsg] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((j) => {
        if (j.success)
          setLoyalty({
            perCurrency: Number(j.data.pointsPerCurrency) || 100,
            value: Number(j.data.pointsValue) || 1,
          });
      })
      .catch(() => undefined);
  }, []);

  async function printReceipt(sale: Sale) {
    setReceiptStatus("Printing…");
    try {
      const res = await fetch("/api/print", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          station: "RECEIPT",
          content: saleToTicketText(sale),
        }),
      });
      const json = await res.json();
      setReceiptStatus(json.success ? "Printed ✓" : (json.error ?? "Failed"));
    } catch {
      setReceiptStatus("Print failed");
    }
  }

  async function sendWhatsApp(sale: Sale) {
    const mobile =
      sale.customerMobile ||
      (typeof window !== "undefined"
        ? window.prompt("Customer WhatsApp number")
        : null);
    if (!mobile) return;
    setWaStatus("Sending…");
    try {
      const res = await fetch(`/api/sales/${sale.id}/whatsapp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mobile }),
      });
      const json = await res.json();
      setWaStatus(json.success ? "Sent ✓" : (json.error ?? "Failed"));
    } catch {
      setWaStatus("Failed to send");
    }
  }

  // Loyalty redeem: cap by available points and remaining discountable amount.
  const afterLines = totals.subtotal - totals.lineDiscount;
  const redeemRoom = Math.max(0, afterLines - totals.finalDiscount);
  const redeemPoints = Math.min(store.redeemPoints, store.customerPoints);
  const redeemValue = Math.min(redeemPoints * loyalty.value, redeemRoom);
  const pointsUsed =
    loyalty.value > 0 ? Math.round(redeemValue / loyalty.value) : 0;
  const chargedTotal = Math.max(0, totals.total - redeemValue);

  const paid = Number(customerPaid) || 0;
  const balance = paid - chargedTotal;
  const finalPct =
    afterLines > 0 ? (totals.finalDiscount / afterLines) * 100 : 0;

  async function proceed() {
    if (method === "cash" && paid < chargedTotal) {
      setError("Customer paid is less than the total");
      return;
    }
    setError(null);
    setPending(true);
    try {
      const res = await fetch("/api/sales", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lines: store.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            discount: l.discount,
          })),
          paymentMethod: method,
          isWholesale: store.isWholesale,
          serviceCharge: store.serviceCharge,
          finalDiscount: store.finalDiscount + redeemValue,
          customerName: store.customerName || undefined,
          customerMobile: store.customerMobile || undefined,
          employee: store.employee || undefined,
          cashReceived: method === "cash" ? paid : undefined,
          clientUuid: crypto.randomUUID(),
        }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.error ?? "Sale failed");
        return;
      }
      const sale = json.data as Sale;
      setDone(sale);

      // Loyalty: award earned points, deduct redeemed, for the selected customer.
      if (store.customerId) {
        const earn = Math.floor(sale.total / loyalty.perCurrency);
        try {
          const lr = await fetch("/api/loyalty", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              customerId: store.customerId,
              earn,
              redeem: pointsUsed,
            }),
          });
          const lj = await lr.json();
          if (lj.success) {
            setEarnedMsg(
              `+${earn} pts${pointsUsed ? `, −${pointsUsed} redeemed` : ""} · balance ${lj.data.points}`,
            );
          }
        } catch {
          // Non-fatal: the sale succeeded regardless.
        }
      }

      store.clear();
      setCustomerPaid("");
    } catch {
      setError("Could not reach the server");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <div className="flex h-full flex-col items-center justify-center rounded-xl border border-line bg-surface-1 p-8 text-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 18 }}
          className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-3xl text-accent"
        >
          ✓
        </motion.div>
        <h1 className="mt-4 text-lg font-semibold text-text-strong">
          {done.id}
        </h1>
        <p className="mt-1 text-3xl font-bold text-accent">
          {formatMoney(done.total)}
        </p>
        {done.change != null && done.change > 0 && (
          <p className="mt-1 text-sm text-text-dim">
            Change due: {formatMoney(done.change)}
          </p>
        )}
        {earnedMsg && (
          <p className="mt-2 rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
            {earnedMsg}
          </p>
        )}

        <div className="mt-6 grid w-full grid-cols-2 gap-2">
          <a
            href={`/api/sales/${done.id}/invoice`}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-line py-2.5 text-center text-sm text-text-body transition hover:border-accent hover:text-accent"
          >
            Invoice PDF
          </a>
          <button
            onClick={() => printReceipt(done)}
            className="rounded-lg border border-line py-2.5 text-sm text-text-body transition hover:border-accent hover:text-accent"
          >
            {receiptStatus ?? "Print receipt"}
          </button>
        </div>
        <button
          onClick={() => sendWhatsApp(done)}
          className="mt-2 w-full rounded-lg border border-line py-2.5 text-sm text-text-body transition hover:border-accent hover:text-accent"
        >
          {waStatus ?? "Send invoice on WhatsApp"}
        </button>

        <button
          onClick={() => {
            setDone(null);
            setWaStatus(null);
            setReceiptStatus(null);
            setEarnedMsg(null);
          }}
          className="mt-3 w-full rounded-lg bg-accent py-3 font-semibold text-accent-ink transition hover:bg-accent-strong"
        >
          New sale (INSERT)
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col rounded-xl border border-line bg-surface-1">
      <div className="border-b border-line px-5 py-3.5">
        <h2 className="font-semibold text-text-strong">
          Billed items{" "}
          <span className="text-sm font-normal text-text-dim">
            ({store.lines.length})
          </span>
        </h2>
      </div>

      {/* Cart lines */}
      <div className="flex-1 overflow-y-auto px-4 py-3">
        {store.lines.length === 0 ? (
          <p className="mt-10 text-center text-sm text-text-dim">
            Scan or tap a product to begin
          </p>
        ) : (
          <AnimatePresence initial={false}>
            {store.lines.map((l) => (
              <motion.div
                key={l.productId}
                layout
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.18 }}
                className="mb-2.5 rounded-lg border border-line bg-surface-2 p-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-medium text-text-strong">
                    {l.name}
                  </p>
                  <button
                    onClick={() => store.remove(l.productId)}
                    aria-label={`Remove ${l.name}`}
                    className="text-text-dim transition hover:text-danger"
                  >
                    ✕
                  </button>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    <StepBtn
                      label="−"
                      onClick={() =>
                        store.setQuantity(l.productId, l.quantity - 1)
                      }
                    />
                    <span className="w-8 text-center text-sm font-semibold text-text-strong">
                      {l.quantity}
                    </span>
                    <StepBtn
                      label="+"
                      onClick={() =>
                        store.setQuantity(l.productId, l.quantity + 1)
                      }
                    />
                    {l.maxDiscount > 0 && (
                      <input
                        type="number"
                        min={0}
                        max={l.maxDiscount}
                        value={l.discount || ""}
                        placeholder="disc"
                        onChange={(e) =>
                          store.setDiscount(l.productId, Number(e.target.value))
                        }
                        title={`Max discount ${l.maxDiscount}`}
                        className="ml-2 w-16 rounded border border-line bg-surface-1 px-2 py-1 text-xs text-text-strong outline-none focus:border-accent"
                      />
                    )}
                  </div>
                  <p className="text-sm font-semibold text-accent">
                    {formatMoney(
                      (effectivePrice(l, store.isWholesale) - l.discount) *
                        l.quantity,
                    )}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Totals + payment */}
      <div className="space-y-2 border-t border-line px-5 py-4">
        <Row label="Sub total" value={formatMoney(totals.subtotal)} />
        {totals.lineDiscount > 0 && (
          <Row
            label="Item discounts"
            value={`-${formatMoney(totals.lineDiscount)}`}
            tone="warn"
          />
        )}

        <Field label="Service charge">
          <NumberInput
            value={store.serviceCharge}
            onChange={store.setServiceCharge}
            placeholder="0"
          />
        </Field>
        <Field label="Final discount (Rs)">
          <NumberInput
            value={store.finalDiscount}
            onChange={store.setFinalDiscount}
            placeholder="0"
          />
        </Field>
        <Field label="Final discount (%)">
          <NumberInput
            value={Number(finalPct.toFixed(2))}
            onChange={(pct) => {
              const base = totals.subtotal - totals.lineDiscount;
              store.setFinalDiscount((base * pct) / 100);
            }}
            placeholder="0"
          />
        </Field>

        {redeemValue > 0 && (
          <Row
            label={`Points redeemed (${pointsUsed})`}
            value={`-${formatMoney(redeemValue)}`}
            tone="warn"
          />
        )}

        <div className="flex items-center justify-between pt-1">
          <p className="font-semibold text-text-strong">Total</p>
          <motion.p
            key={chargedTotal}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            className="text-xl font-bold text-accent"
          >
            {formatMoney(chargedTotal)}
          </motion.p>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-2">
          {PAYMENT_METHODS.map((m) => (
            <button
              key={m.id}
              onClick={() => setMethod(m.id)}
              className={`rounded-lg border py-2 text-sm font-medium transition ${
                method === m.id
                  ? "border-accent bg-accent/10 text-accent"
                  : "border-line text-text-dim hover:text-text-body"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Customer + loyalty */}
        <div className="pt-1">
          {store.customerId ? (
            <div className="rounded-lg border border-accent/40 bg-accent/5 p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-text-strong">
                    {store.customerName || "Customer"}
                  </p>
                  <p className="text-xs text-text-dim">
                    {store.customerMobile} · {store.customerPoints} points
                  </p>
                </div>
                <button
                  onClick={() => store.clearCustomer()}
                  className="text-xs text-text-dim transition hover:text-danger"
                >
                  Change
                </button>
              </div>
              {store.customerPoints > 0 && (
                <label className="mt-2 flex items-center justify-between gap-2 text-xs text-text-dim">
                  Redeem points
                  <input
                    type="number"
                    min={0}
                    max={store.customerPoints}
                    value={store.redeemPoints || ""}
                    placeholder="0"
                    onChange={(e) =>
                      store.setRedeemPoints(Number(e.target.value))
                    }
                    className="w-24 rounded border border-line bg-surface-1 px-2 py-1 text-right text-text-strong outline-none focus:border-accent"
                  />
                </label>
              )}
            </div>
          ) : (
            <>
              <CustomerPicker onSelect={store.selectCustomer} />
              <div className="mt-2 grid grid-cols-2 gap-2">
                <input
                  value={store.customerName}
                  onChange={(e) => store.setCustomerName(e.target.value)}
                  placeholder="Walk-in name"
                  className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text-strong outline-none focus:border-accent"
                />
                <input
                  value={store.customerMobile}
                  onChange={(e) => store.setCustomerMobile(e.target.value)}
                  placeholder="Mobile"
                  className="rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text-strong outline-none focus:border-accent"
                />
              </div>
            </>
          )}
        </div>
        <input
          value={store.employee}
          onChange={(e) => store.setEmployee(e.target.value)}
          placeholder="Employee (optional)"
          className="mt-2 w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-sm text-text-strong outline-none focus:border-accent"
        />

        {method === "cash" && (
          <div className="pt-1">
            <Field label="Customer paid">
              <NumberInput
                value={paid || 0}
                onChange={(v) => setCustomerPaid(String(v))}
                placeholder="0"
              />
            </Field>
            <p
              className={`mt-1 text-right text-sm ${
                balance < 0 ? "text-danger" : "text-text-dim"
              }`}
            >
              Balance: {formatMoney(Math.max(balance, 0))}
            </p>
          </div>
        )}

        {error && (
          <p className="rounded-lg border border-danger/40 bg-danger/10 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}

        <motion.button
          whileTap={{ scale: store.lines.length ? 0.98 : 1 }}
          disabled={
            pending ||
            store.lines.length === 0 ||
            (method === "cash" && balance < 0)
          }
          onClick={proceed}
          className="mt-2 w-full rounded-lg bg-accent py-3.5 font-semibold text-accent-ink transition hover:bg-accent-strong disabled:cursor-not-allowed disabled:opacity-40"
        >
          {pending ? "Processing…" : `Proceed · ${formatMoney(chargedTotal)}`}
        </motion.button>
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

function Row({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "warn";
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <p className="text-text-dim">{label}</p>
      <p className={tone === "warn" ? "text-warn" : "text-text-body"}>{value}</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label className="text-sm text-text-dim">{label}</label>
      <div className="w-28">{children}</div>
    </div>
  );
}

function NumberInput({
  value,
  onChange,
  placeholder,
}: {
  value: number;
  onChange: (v: number) => void;
  placeholder?: string;
}) {
  return (
    <input
      type="number"
      min={0}
      value={value || ""}
      placeholder={placeholder}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-1.5 text-right text-sm text-text-strong outline-none focus:border-accent"
    />
  );
}
