import { getRepository } from "@/lib/server/repositories";
import { formatMoney, formatDateTime } from "@/lib/format";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

export const dynamic = "force-dynamic";

export default async function SalesPage() {
  const repo = await getRepository();
  const sales = await repo.listSales(200);

  return (
    <div className="mx-auto max-w-4xl px-6 py-8">
      <ModuleHeader
        title="Sales history"
        subtitle={`${sales.length} most recent transactions`}
      />

      {sales.length === 0 ? (
        <p className="mt-8 rounded-xl border border-dashed border-line p-10 text-center text-sm text-text-dim">
          No sales recorded yet.
        </p>
      ) : (
        <div className="mt-6 space-y-3">
          {sales.map((s) => (
            <details
              key={s.id}
              className="group rounded-xl border border-line bg-surface-1 transition-colors hover:border-accent/40"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4">
                <div>
                  <p className="font-medium text-text-strong">{s.id}</p>
                  <p className="text-xs text-text-dim">
                    {formatDateTime(s.createdAt)} · {s.paymentMethod} ·{" "}
                    {s.lines.length} lines
                  </p>
                </div>
                <p className="font-semibold text-accent">
                  {formatMoney(s.total)}
                </p>
              </summary>
              <div className="border-t border-line px-5 py-3">
                <ul className="space-y-1.5 text-sm">
                  {s.lines.map((l) => (
                    <li
                      key={l.productId}
                      className="flex justify-between text-text-dim"
                    >
                      <span>
                        {l.quantity} × {l.name}
                        {l.discount > 0 && (
                          <span className="text-warn">
                            {" "}
                            (−{formatMoney(l.discount)}/u)
                          </span>
                        )}
                      </span>
                      <span className="text-text-body">
                        {formatMoney(l.lineTotal)}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
