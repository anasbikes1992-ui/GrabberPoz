"use client";

import { motion } from "framer-motion";

interface StatCardProps {
  label: string;
  value: string;
  hint?: string;
  tone?: "accent" | "warn" | "danger" | "info";
  index?: number;
}

const TONE_CLASS: Record<NonNullable<StatCardProps["tone"]>, string> = {
  accent: "text-accent",
  warn: "text-warn",
  danger: "text-danger",
  info: "text-info",
};

export function StatCard({
  label,
  value,
  hint,
  tone = "accent",
  index = 0,
}: StatCardProps) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.07, duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      whileHover={{ y: -3 }}
      className="rounded-xl border border-line bg-surface-1 p-5"
    >
      <p className="text-xs font-medium uppercase tracking-wider text-text-dim">
        {label}
      </p>
      <p className={`mt-2 text-2xl font-semibold ${TONE_CLASS[tone]}`}>
        {value}
      </p>
      {hint && <p className="mt-1 text-xs text-text-dim">{hint}</p>}
    </motion.article>
  );
}
