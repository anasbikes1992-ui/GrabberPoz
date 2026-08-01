"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const VARIANT: Record<Variant, string> = {
  primary:
    "bg-accent text-accent-ink hover:bg-accent-strong disabled:opacity-60",
  secondary:
    "border border-line bg-surface-2 text-text-strong hover:border-accent hover:text-accent",
  ghost:
    "border border-line text-text-dim hover:border-accent hover:text-accent",
  danger:
    "border border-danger/40 bg-danger/10 text-danger hover:bg-danger/20",
};

const SIZE: Record<Size, string> = {
  sm: "min-h-9 rounded-lg px-2.5 py-1.5 text-xs",
  md: "min-h-10 rounded-xl px-4 py-2.5 text-sm",
  lg: "min-h-11 rounded-xl px-5 py-3 text-sm font-semibold",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
}) {
  return (
    <button
      type={type}
      className={`inline-flex items-center justify-center font-semibold transition duration-150 ease-out disabled:cursor-not-allowed ${VARIANT[variant]} ${SIZE[size]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
