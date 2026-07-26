import type { MetadataRoute } from "next";
import { readSettings } from "@/lib/server/settings-store";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await readSettings();
  const slug = settings.storeSlug || "main-store";
  const baseUrl = "https://grabber-pos.vercel.app";

  return [
    {
      url: `${baseUrl}/store/${slug}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
  ];
}
