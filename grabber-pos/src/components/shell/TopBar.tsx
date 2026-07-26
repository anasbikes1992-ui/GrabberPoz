"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { useBrand } from "@/components/brand/BrandProvider";

export function TopBar() {
  const router = useRouter();
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

  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-line bg-surface-1/90 px-5 backdrop-blur">
      <Link href="/" className="flex items-center gap-2">
        {brand.logoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={brand.logoUrl} alt="" className="h-7 w-7 rounded object-cover" />
        ) : null}
        <span className="text-lg font-semibold tracking-tight text-text-strong">
          {brand.businessName || "GRABBER POS"}
        </span>
      </Link>
      <div className="flex items-center gap-2">
        <Link
          href="/"
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-text-dim transition hover:border-accent hover:text-accent"
        >
          Home
        </Link>
        <button
          onClick={logout}
          className="rounded-lg border border-line px-3 py-1.5 text-sm text-text-dim transition hover:border-danger/50 hover:text-danger"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
