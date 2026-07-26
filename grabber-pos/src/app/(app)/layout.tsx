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
        <TopBar />
        <LicenceBanner />
        <PageTransition>{children}</PageTransition>
      </div>
    </BrandProvider>
  );
}
