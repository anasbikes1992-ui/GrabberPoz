"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { Sale } from "@/lib/types";
import { formatMoney } from "@/lib/format";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

export default function ReportsPage() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sales")
      .then((r) => r.json())
      .then((json) => json.success && setSales(json.data))
      .catch(() => undefined)
      .finally(() => setLoading(false));
  }, []);

  const report = useMemo(() => buildReport(sales), [sales]);

  return (
    <div className="mx-auto max-w-5xl px-6 py-8">
      <ModuleHeader
        title="Reports"
        subtitle={`${sales.length} transactions analysed`}
      />

      {loading ? (
        <p className="mt-10 text-center text-sm text-text-dim">Loading…</p>
      ) : sales.length === 0 ? (
        <p className="mt-10 rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-dim">
          No sales yet — make a sale to see reports.
        </p>
      ) : (
        <div className="mt-8 space-y-8">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <Kpi label="Revenue" value={formatMoney(report.revenue)} />
            <Kpi label="Sales" value={String(report.count)} />
            <Kpi label="Avg. sale" value={formatMoney(report.avg)} />
            <Kpi label="Items sold" value={String(report.itemsSold)} />
          </div>

          <Panel title="Revenue — last 7 days">
            <BarList
              rows={report.byDay.map((d) => ({
                label: d.label,
                value: d.total,
                display: formatMoney(d.total),
              }))}
            />
          </Panel>

          <div className="grid gap-6 lg:grid-cols-2">
            <Panel title="By payment method">
              <BarList
                rows={report.byMethod.map((m) => ({
                  label: m.method,
                  value: m.total,
                  display: `${formatMoney(m.total)} · ${m.count}`,
                }))}
              />
            </Panel>
            <Panel title="Top products">
              <BarList
                rows={report.topProducts.map((p) => ({
                  label: p.name,
                  value: p.qty,
                  display: `${p.qty} sold`,
                }))}
              />
            </Panel>
          </div>
        </div>
      )}
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-line bg-surface-1 p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
        {label}
      </p>
      <p className="mt-2 text-2xl font-semibold text-accent">{value}</p>
    </motion.div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-line bg-surface-1 p-5">
      <h2 className="mb-4 text-sm font-medium text-text-strong">{title}</h2>
      {children}
    </section>
  );
}

function BarList({
  rows,
}: {
  rows: { label: string; value: number; display: string }[];
}) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  if (rows.length === 0)
    return <p className="text-sm text-text-dim">No data.</p>;
  return (
    <div className="space-y-2.5">
      {rows.map((r, i) => (
        <div key={r.label + i}>
          <div className="mb-1 flex justify-between text-xs">
            <span className="truncate pr-2 text-text-body">{r.label}</span>
            <span className="shrink-0 text-text-dim">{r.display}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-surface-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(r.value / max) * 100}%` }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="h-full rounded-full bg-accent"
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function buildReport(sales: Sale[]) {
  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const count = sales.length;
  const itemsSold = sales.reduce(
    (s, x) => s + x.lines.reduce((n, l) => n + l.quantity, 0),
    0,
  );

  const methodMap = new Map<string, { count: number; total: number }>();
  for (const s of sales) {
    const m = methodMap.get(s.paymentMethod) ?? { count: 0, total: 0 };
    m.count += 1;
    m.total += s.total;
    methodMap.set(s.paymentMethod, m);
  }

  const dayMap = new Map<string, number>();
  const days: { key: string; label: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ key, label: d.toLocaleDateString("en-GB", { weekday: "short" }) });
    dayMap.set(key, 0);
  }
  for (const s of sales) {
    const key = s.createdAt.slice(0, 10);
    if (dayMap.has(key)) dayMap.set(key, (dayMap.get(key) ?? 0) + s.total);
  }

  const productMap = new Map<string, number>();
  for (const s of sales) {
    for (const l of s.lines) {
      productMap.set(l.name, (productMap.get(l.name) ?? 0) + l.quantity);
    }
  }

  return {
    revenue,
    count,
    avg: count ? revenue / count : 0,
    itemsSold,
    byMethod: [...methodMap.entries()].map(([method, v]) => ({ method, ...v })),
    byDay: days.map((d) => ({ label: d.label, total: dayMap.get(d.key) ?? 0 })),
    topProducts: [...productMap.entries()]
      .map(([name, qty]) => ({ name, qty }))
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5),
  };
}
