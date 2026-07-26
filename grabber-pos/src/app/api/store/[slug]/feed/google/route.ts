import { NextResponse } from "next/server";
import { getRepository } from "@/lib/server/repositories";
import { readSettings } from "@/lib/server/settings-store";

export async function GET() {
  const repo = await getRepository();
  const page = await repo.queryProducts({ pageSize: 500 });
  const settings = await readSettings();
  const products = page.items;

  const xmlItems = products
    .map(
      (p) => `
    <item>
      <g:id>${p.id}</g:id>
      <title><![CDATA[${p.name}]]></title>
      <description><![CDATA[${p.name} - Available at ${settings.businessName}]]></description>
      <link>https://grabber-pos.vercel.app/store/${settings.storeSlug || "main-store"}</link>
      <g:price>${p.salePrice} ${settings.currency || "LKR"}</g:price>
      <g:availability>${p.quantity > 0 ? "in_stock" : "out_of_stock"}</g:availability>
      <g:condition>new</g:condition>
      <g:brand><![CDATA[${settings.businessName}]]></g:brand>
    </item>`,
    )
    .join("");

  const rssXml = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title><![CDATA[${settings.businessName} Product Feed]]></title>
    <link>https://grabber-pos.vercel.app/store/${settings.storeSlug || "main-store"}</link>
    <description><![CDATA[Automated Google Shopping product feed for ${settings.businessName}]]></description>
    ${xmlItems}
  </channel>
</rss>`;

  return new NextResponse(rssXml, {
    headers: {
      "Content-Type": "application/xml",
      "Cache-Control": "s-maxage=3600, stale-while-revalidate",
    },
  });
}
