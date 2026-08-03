import type { Metadata } from "next";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import {
  getStorefrontCatalog,
  getStorefrontInfo,
} from "@/lib/server/storefront-repo";
import { readWebsite } from "@/lib/server/website-store";
import { readSettings } from "@/lib/server/settings-store";
import StorefrontClient from "./StorefrontClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await readSettings();
  const website = await readWebsite();
  const title =
    website.seoTitle ||
    `${settings.businessName} — Online Store & Fast Delivery`;
  const description =
    website.seoDescription ||
    settings.storeSlogan ||
    `Shop online at ${settings.businessName}. Quality products, best prices, and fast delivery.`;
  const og = website.ogImageUrl || website.banners[0]?.imageUrl || settings.storeBanner;

  return {
    title,
    description,
    keywords: [
      settings.businessName,
      "online store",
      "shopping",
      "buy online",
      "fast delivery",
      "retail shop",
      slug,
    ],
    openGraph: {
      title,
      description,
      type: "website",
      siteName: settings.businessName,
      images: og ? [{ url: og }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: og ? [og] : [],
    },
    robots: {
      index: website.enabled,
      follow: website.enabled,
    },
  };
}

export default async function TenantStorePage({
  params,
}: {
  params: Promise<{ slug: string }> | any;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "main-store";
  const host = (await headers()).get("host");
  const info = await getStorefrontInfo({ host, slug });
  if (!info) notFound();

  const website = await readWebsite();
  const settings = await readSettings();
  const catalog = await getStorefrontCatalog({ host, slug }, { size: 100 });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: info.businessName,
    description: website.seoDescription || settings.storeSlogan,
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuItem: catalog.items.slice(0, 20).map((p) => ({
        "@type": "MenuItem",
        name: p.name,
        offers: {
          "@type": "Offer",
          price: p.price,
          priceCurrency: settings.currency || "LKR",
          availability:
            p.stock > 0
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      })),
    },
  };

  const adsId = settings.googleAdsId || info.googleAdsId;
  const pixelId = settings.metaPixelId || info.metaPixelId;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {adsId && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${adsId}`}
        />
      )}
      {adsId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${adsId}');
            `,
          }}
        />
      )}
      {pixelId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${pixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      <StorefrontClient
        slug={slug}
        businessName={info.businessName}
        website={website}
        products={catalog.items}
        categories={catalog.categories}
        phone={settings.phone}
        currency={settings.currency || "LKR"}
      />
    </>
  );
}
