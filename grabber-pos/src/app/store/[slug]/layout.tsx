import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStorefrontInfo } from "@/lib/server/storefront-repo";
import { readWebsite } from "@/lib/server/website-store";
import { storefrontThemeClass } from "@/lib/website";
import { StorefrontAnalytics } from "@/components/storefront/Analytics";
import { CartProvider, CartButton } from "./cart";

/**
 * Public shop chrome. Deliberately outside the `(app)` group — no POS shell, no
 * auth-dependent providers, nothing that assumes a signed-in user.
 */
export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }> | any;
}) {
  const resolvedParams = await params;
  const slug = resolvedParams?.slug || "";
  const host = (await headers()).get("host");
  const info = await getStorefrontInfo({ host, slug });
  if (!info) notFound();

  const website = await readWebsite();
  const themeClass = storefrontThemeClass(website.theme);

  return (
    <div className={`${themeClass} min-h-screen font-sans`}>
      <CartProvider
        slug={slug}
        businessName={info.businessName}
        whatsappNumber={website.whatsappNumber || info.whatsappNumber}
        currency="LKR"
        website={website}
      >
        <StorefrontAnalytics
          ga4Id={info.ga4Id}
          googleAdsId={info.googleAdsId}
          metaPixelId={info.metaPixelId}
        />

        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <header className="sticky top-0 z-30 border-b border-line bg-surface-1/95 backdrop-blur-md">
          <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3.5 lg:px-8">
            <Link href={`/store/${slug}`} className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--tint-teal)] to-[var(--accent)] text-lg font-bold text-white shadow-[0_4px_14px_-4px_color-mix(in_oklch,var(--accent)_40%,transparent)]">
                {info.businessName.charAt(0)}
              </span>
              <span className="min-w-0">
                <span className="block truncate text-base font-semibold leading-tight text-text-strong sm:text-lg">
                  {info.businessName}
                </span>
                <span className="block text-xs text-text-dim">Official online store</span>
              </span>
            </Link>
            <nav aria-label="Store" className="flex shrink-0 items-center gap-2">
              <Link
                href={`/store/${slug}/account`}
                className="hidden rounded-xl border border-line px-3 py-2 text-xs font-semibold text-text-dim transition hover:border-accent hover:text-accent sm:inline-flex"
              >
                Account
              </Link>
              <CartButton />
            </nav>
          </div>
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <footer className="mt-12 border-t border-line bg-surface-1 px-4 py-10 text-center text-xs text-text-dim lg:px-8">
          <p>
            © {new Date().getFullYear()} {info.businessName}. Pickup &amp; delivery
            options at checkout.
          </p>
          <p className="mt-2">
            Powered by{" "}
            <span className="font-medium text-text-body">GRABBER POS Studio</span>
          </p>
        </footer>
      </CartProvider>
    </div>
  );
}
