import Link from "next/link";
import { headers } from "next/headers";
import { notFound } from "next/navigation";
import { getStorefrontInfo } from "@/lib/server/storefront-repo";
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

  return (
    <CartProvider
      slug={slug}
      businessName={info.businessName}
      whatsappNumber={info.whatsappNumber}
      currency="LKR"
    >
      <StorefrontAnalytics
        ga4Id={info.ga4Id}
        googleAdsId={info.googleAdsId}
        metaPixelId={info.metaPixelId}
      />

      <div className="min-h-screen bg-slate-950 font-sans text-slate-100">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-4 backdrop-blur-md lg:px-8">
          <Link href={`/store/${slug}`} className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-sky-500 text-xl font-bold text-white shadow-lg shadow-emerald-500/20">
              {info.businessName.charAt(0)}
            </span>
            <span>
              <span className="block text-lg font-bold leading-tight">
                {info.businessName}
              </span>
              <span className="block text-xs text-slate-400">Official online store</span>
            </span>
          </Link>
          <nav aria-label="Store">
            <CartButton />
          </nav>
        </header>

        <main id="main" tabIndex={-1}>
          {children}
        </main>

        <footer className="mt-16 border-t border-slate-800 px-4 py-10 text-center text-xs text-slate-500 lg:px-8">
          <p>
            © {new Date().getFullYear()} {info.businessName}. Cash on delivery available.
          </p>
          <p className="mt-2">
            Powered by <span className="text-slate-400">GRABBER POS Studio</span>
          </p>
        </footer>
      </div>
    </CartProvider>
  );
}
