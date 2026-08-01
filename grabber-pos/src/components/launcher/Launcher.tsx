"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MODULE_GROUPS, type ModuleTile } from "@/lib/modules";
import { useBrand } from "@/components/brand/BrandProvider";

export function Launcher() {
  const { brand, enabledKeys, loading } = useBrand();
  const businessName = brand.businessName || "GRABBER POS";

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"
      >
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-text-strong sm:text-3xl">
            {businessName}
          </h1>
          <p className="mt-1 max-w-xl text-sm text-text-dim">
            Choose a sale mode to start billing, or open a business tool.
          </p>
        </div>
        <Link
          href="/pos"
          className="inline-flex min-h-11 w-full items-center justify-center rounded-xl bg-accent px-5 text-sm font-semibold text-accent-ink transition duration-150 ease-out hover:bg-accent-strong sm:w-auto"
        >
          Open retail terminal
        </Link>
      </motion.div>

      {MODULE_GROUPS.map((group, gi) => (
        <section key={group.label} className="mt-8 sm:mt-10">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-text-dim">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.tiles.map((tile, i) => (
              <Tile
                key={tile.key}
                tile={tile}
                delay={gi * 0.04 + i * 0.02}
                locked={!loading && !enabledKeys.has(tile.key)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Tile({
  tile,
  delay,
  locked,
}: {
  tile: ModuleTile;
  delay: number;
  locked: boolean;
}) {
  const active = tile.status === "active" && !locked;
  const initial = tile.title.slice(0, 1).toUpperCase();

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      whileHover={active ? { y: -2 } : undefined}
      className={`group relative flex h-full flex-col rounded-2xl border p-3.5 transition-colors duration-150 ease-out sm:p-5 ${
        active
          ? "cursor-pointer border-line bg-surface-1/90 hover:border-accent hover:bg-surface-2/40"
          : "border-dashed border-line bg-surface-1/35"
      }`}
    >
      <div className="flex items-start justify-between gap-2">
        <span
          className={`flex h-9 w-9 items-center justify-center rounded-xl text-sm font-semibold sm:h-10 sm:w-10 ${
            active
              ? "bg-accent/15 text-accent"
              : "bg-surface-3 text-text-dim"
          }`}
          aria-hidden
        >
          {initial}
        </span>
        {locked ? (
          <span className="rounded-md bg-warn/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-warn sm:text-xs">
            Upgrade
          </span>
        ) : tile.status === "soon" ? (
          <span className="rounded-md bg-surface-3 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-text-dim sm:text-xs">
            Soon
          </span>
        ) : null}
      </div>
      <p
        className={`mt-3 text-sm font-semibold tracking-tight sm:mt-4 sm:text-base ${active ? "text-text-strong" : "text-text-dim"}`}
      >
        {tile.title}
      </p>
      <p className="mt-0.5 text-[11px] leading-snug text-text-dim sm:text-xs">
        {tile.subtitle}
      </p>
      {active && (
        <span className="mt-2 text-sm font-medium text-accent opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-within:opacity-100 sm:mt-3">
          Open
        </span>
      )}
    </motion.div>
  );

  if (active && tile.href) {
    return (
      <Link
        href={tile.href}
        className="block h-full rounded-2xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
      >
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}
