import { NextResponse } from "next/server";
import { getRepository } from "@/lib/server/repositories";
import { readSettings } from "@/lib/server/settings-store";

/** Meta / Facebook catalog product feed (CSV). */
export async function GET() {
  const repo = await getRepository();
  const page = await repo.queryProducts({ pageSize: 500 });
  const settings = await readSettings();
  const products = page.items;
  const currency = settings.currency || "LKR";
  const slug = settings.storeSlug || "main-store";
  const linkBase = `https://grabber-pos.vercel.app/store/${slug}`;

  const header =
    "id,title,description,availability,condition,price,link,brand,image_link";
  const rows = products.map((p) => {
    const availability = p.quantity > 0 ? "in stock" : "out of stock";
    const title = csv(p.name);
    const description = csv(`${p.name} - Available at ${settings.businessName}`);
    const price = `${p.salePrice} ${currency}`;
    const brand = csv(settings.businessName);
    return [
      p.id,
      title,
      description,
      availability,
      "new",
      price,
      linkBase,
      brand,
      "",
    ].join(",");
  });

  const csvBody = [header, ...rows].join("\n");

  return new NextResponse(csvBody, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
      "Content-Disposition": 'inline; filename="meta-product-feed.csv"',
    },
  });
}

function csv(value: string): string {
  const s = String(value ?? "").replace(/"/g, '""');
  return `"${s}"`;
}
