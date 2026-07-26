import type { Metadata } from "next";
import { getRepository } from "@/lib/server/repositories";
import { readSettings } from "@/lib/server/settings-store";
import StorefrontClient from "./StorefrontClient";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const settings = await readSettings();
  const title = `${settings.businessName} — Online Store & Fast Delivery`;
  const description = settings.storeSlogan || `Shop online at ${settings.businessName}. Quality products, best prices, and fast delivery to your doorstep.`;

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
      images: settings.storeBanner ? [{ url: settings.storeBanner }] : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: settings.storeBanner ? [settings.storeBanner] : [],
    },
    robots: {
      index: true,
      follow: true,
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
  const repo = await getRepository();
  const page = await repo.queryProducts({ pageSize: 100 });
  const settings = await readSettings();

  const products = page.items;
  const categories = page.categories;

  // Schema.org JSON-LD Structured Data for Google SEO & Rich Snippets
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.businessName,
    description: settings.storeSlogan,
    telephone: settings.phone,
    email: settings.email,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
    },
    hasMenu: {
      "@type": "Menu",
      hasMenuItem: products.slice(0, 20).map((p) => ({
        "@type": "MenuItem",
        name: p.name,
        offers: {
          "@type": "Offer",
          price: p.salePrice,
          priceCurrency: settings.currency || "LKR",
          availability: p.quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
        },
      })),
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {settings.googleAdsId && (
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=${settings.googleAdsId}`}
        />
      )}
      {settings.googleAdsId && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', '${settings.googleAdsId}');
            `,
          }}
        />
      )}
      {settings.metaPixelId && (
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
              fbq('init', '${settings.metaPixelId}');
              fbq('track', 'PageView');
            `,
          }}
        />
      )}
      <StorefrontClient
        slug={slug}
        settings={settings}
        initialProducts={products}
        categories={categories}
      />
    </>
  );
}
