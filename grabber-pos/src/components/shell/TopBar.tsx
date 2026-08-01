"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useBrand } from "@/components/brand/BrandProvider";

const QUICK_LINKS = [
  { href: "/", label: "Home" },
  { href: "/pos", label: "Sell" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sales", label: "Sales" },
] as const;

export function TopBar() {
  const router = useRouter();
  const pathname = usePathname();
  const { brand } = useBrand();

  async function logout() {
    if (isSupabaseEnabled) {
      await createClient().auth.signOut();
    } else {
      await fetch("/api/auth/login", { method: "DELETE" });
    }
    router.push("/login");
    router.refresh();
  }

  const businessName = brand.businessName || "GRABBER POS";

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between gap-3 border-b border-line bg-surface-1/90 px-3 backdrop-blur-md sm:gap-4 sm:px-5">
      <Link
        href="/"
        className="flex min-w-0 items-center gap-2.5 rounded-lg transition duration-150 hover:opacity-90"
      >
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={brand.logoUrl}
            alt={`${businessName} logo`}
            className="h-8 w-8 rounded-lg object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-xs font-bold text-accent-ink"
          >
            G
          </span>
        )}
        <span className="truncate text-base font-semibold tracking-tight text-text-strong sm:text-lg">
          {businessName}
        </span>
      </Link>
      <nav aria-label="Primary" className="flex items-center gap-1 sm:gap-2">
        <div className="mr-0.5 hidden items-center gap-0.5 md:flex">
          {QUICK_LINKS.map((link) => {
            const active =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-xl px-3 py-1.5 text-sm transition duration-150 ${
                  active
                    ? "bg-accent/15 font-medium text-accent"
                    : "text-text-dim hover:bg-surface-2 hover:text-text-strong"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>
        <Link
          href="/help"
          className="rounded-xl border border-line px-3 py-1.5 text-sm text-text-dim transition duration-150 hover:border-accent hover:text-accent"
        >
          Help
        </Link>
        <button
          type="button"
          onClick={logout}
          className="rounded-xl border border-line px-3 py-1.5 text-sm text-text-dim transition duration-150 hover:border-danger/50 hover:text-danger"
        >
          Sign out
        </button>
      </nav>
    </header>
  );
}
