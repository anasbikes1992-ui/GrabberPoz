"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MODULE_GROUPS, type ModuleTile } from "@/lib/modules";
import { useBrand } from "@/components/brand/BrandProvider";

export function Launcher() {
  const { enabledKeys, loading } = useBrand();

  return (
    <div className="mx-auto max-w-6xl px-6 py-8">
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <h1 className="text-2xl font-semibold text-text-strong">
          What are we selling today?
        </h1>
        <p className="mt-1 text-sm text-text-dim">
          Pick a sale mode, or jump into your business tools.
        </p>
      </motion.div>

      {MODULE_GROUPS.map((group, gi) => (
        <section key={group.label} className="mt-9">
          <h2 className="mb-3 text-xs font-medium uppercase tracking-wider text-text-dim">
            {group.label}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {group.tiles.map((tile, i) => (
              <Tile
                key={tile.key}
                tile={tile}
                delay={gi * 0.05 + i * 0.03}
                // While loading, don't lock anything (avoid a flash of locks).
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

  const inner = (
    <motion.div
      initial={{ opacity: 0, y: 14, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      whileHover={active ? { y: -4 } : undefined}
      className={`group relative flex h-full flex-col rounded-2xl border p-5 transition-colors ${
        active
          ? "cursor-pointer border-line bg-surface-1 hover:border-accent"
          : "border-dashed border-line bg-surface-1/40"
      }`}
    >
      <div className="flex items-start justify-between">
        <span
          className={`text-3xl ${!active ? "opacity-40 grayscale" : ""}`}
          aria-hidden
        >
          {tile.icon}
        </span>
        {locked ? (
          <span className="rounded-full bg-warn/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-warn">
            🔒 Upgrade
          </span>
        ) : tile.status === "soon" ? (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-text-dim">
            Soon
          </span>
        ) : null}
      </div>
      <p
        className={`mt-4 font-semibold ${active ? "text-text-strong" : "text-text-dim"}`}
      >
        {tile.title}
      </p>
      <p className="mt-0.5 text-xs text-text-dim">{tile.subtitle}</p>
      {active && (
        <span className="mt-3 text-sm text-accent opacity-0 transition-opacity group-hover:opacity-100">
          Open →
        </span>
      )}
    </motion.div>
  );

  if (active && tile.href) {
    return (
      <Link href={tile.href} className="block h-full">
        {inner}
      </Link>
    );
  }
  return <div className="h-full">{inner}</div>;
}
