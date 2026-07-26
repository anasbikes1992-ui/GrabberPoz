"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";

interface ModuleHeaderProps {
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
}

/** Compact header for a module screen: back + home + title, optional actions. */
export function ModuleHeader({ title, subtitle, actions }: ModuleHeaderProps) {
  const router = useRouter();
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          aria-label="Back"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-dim transition hover:border-accent hover:text-accent"
        >
          ←
        </button>
        <Link
          href="/"
          aria-label="Home"
          className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-text-dim transition hover:border-accent hover:text-accent"
        >
          ⌂
        </Link>
        <div>
          <h1 className="text-xl font-semibold text-text-strong">{title}</h1>
          {subtitle && <p className="text-sm text-text-dim">{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
