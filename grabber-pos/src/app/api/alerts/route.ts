import { NextResponse } from "next/server";
import { allProducts } from "@/lib/server/product-repo";

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_WARNING_DAYS = 30;

interface AlertItem {
  id: string;
  name: string;
  quantity: number;
  expireDate: string | null;
}

export function GET() {
  const products = allProducts();
  const now = Date.now();
  const warnBefore = now + EXPIRY_WARNING_DAYS * 86_400_000;

  const lowStock: AlertItem[] = [];
  const expiring: AlertItem[] = [];
  const expired: AlertItem[] = [];

  for (const p of products) {
    const item: AlertItem = {
      id: p.id,
      name: p.name,
      quantity: p.quantity,
      expireDate: p.expireDate,
    };
    if (p.quantity <= LOW_STOCK_THRESHOLD) lowStock.push(item);
    if (p.expireDate) {
      const t = new Date(p.expireDate).getTime();
      if (!Number.isNaN(t)) {
        if (t < now) expired.push(item);
        else if (t <= warnBefore) expiring.push(item);
      }
    }
  }

  const cap = (a: AlertItem[]) =>
    a.sort((x, y) => x.quantity - y.quantity).slice(0, 100);

  return NextResponse.json({
    success: true,
    data: {
      lowStock: cap(lowStock),
      expiring: expiring.slice(0, 100),
      expired: expired.slice(0, 100),
      counts: {
        lowStock: lowStock.length,
        expiring: expiring.length,
        expired: expired.length,
      },
    },
    error: null,
  });
}
