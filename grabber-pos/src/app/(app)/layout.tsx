import { TopBar } from "@/components/shell/TopBar";
import { PageTransition } from "@/components/shell/PageTransition";
import { BrandProvider } from "@/components/brand/BrandProvider";
import { LicenceBanner } from "@/components/brand/LicenceBanner";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <BrandProvider>
      <div className="flex min-h-screen flex-col">
        <a href="#main" className="skip-link">
          Skip to main content
        </a>
        <TopBar />
        <LicenceBanner />
        <main id="main" className="flex-1" tabIndex={-1}>
          <PageTransition>{children}</PageTransition>
        </main>
      </div>
    </BrandProvider>
  );
}
