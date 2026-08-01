"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";

const FEATURES = [
  { title: "Multi-vertical selling", body: "Retail, restaurant, repair, rooms, and more" },
  { title: "Server-authoritative totals", body: "Prices and stock checked before every sale" },
  { title: "Reseller-ready licensing", body: "Plans, branding, and expiry enforced on the server" },
];

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      if (isSupabaseEnabled) {
        const supabase = createClient();
        const { error: authError } = await supabase.auth.signInWithPassword({
          email: username,
          password,
        });
        if (authError) {
          setError(authError.message);
          return;
        }
      } else {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username, password }),
        });
        const json = await res.json();
        if (!json.success) {
          setError(json.error ?? "Login failed");
          return;
        }
      }
      router.push("/");
      router.refresh();
    } catch {
      setError("Could not reach the server. Check your connection and try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-stretch">
      <a href="#login-form" className="skip-link">
        Skip to main content
      </a>
      <section className="relative hidden flex-1 flex-col justify-center overflow-hidden px-12 xl:px-16 lg:flex">
        <motion.div
          aria-hidden
          className="absolute -top-40 -left-40 h-130 w-130 rounded-full bg-accent/12 blur-3xl"
          animate={{ scale: [1, 1.12, 1], opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="mb-8 flex items-center gap-3">
            <span
              aria-hidden
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-accent text-base font-bold text-accent-ink"
            >
              G
            </span>
            <p className="text-sm font-medium text-accent">
              Grabber Mobility Solutions
            </p>
          </div>
          <h1 className="max-w-lg text-5xl font-semibold tracking-tight text-text-strong xl:text-6xl">
            GRABBER POS Studio
          </h1>
        </motion.div>
        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.45 }}
          className="mt-4 max-w-md text-base leading-relaxed text-text-dim"
        >
          One platform for every counter — back office, terminal, and licensing.
        </motion.p>
        <ul className="mt-12 space-y-5">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.title}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + i * 0.1, duration: 0.45 }}
              className="flex items-start gap-3"
            >
              <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-accent" />
              <div>
                <p className="font-medium text-text-strong">{f.title}</p>
                <p className="text-sm text-text-dim">{f.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
        <p className="mt-16 text-xs text-text-dim">
          Looking for product details?{" "}
          <Link href="/welcome" className="text-accent transition hover:underline">
            View the overview
          </Link>
        </p>
      </section>

      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-6">
        <motion.form
          id="login-form"
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-2xl border border-line bg-surface-1/95 p-6 shadow-[0_24px_60px_-28px_rgba(0,0,0,0.55)] sm:p-8"
        >
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <span
              aria-hidden
              className="flex h-9 w-9 items-center justify-center rounded-xl bg-accent text-sm font-bold text-accent-ink"
            >
              G
            </span>
            <div>
              <p className="text-sm font-semibold tracking-tight text-text-strong">
                GRABBER POS Studio
              </p>
              <p className="text-xs text-text-dim">Sign in to continue</p>
            </div>
          </div>

          <h2 className="hidden text-2xl font-semibold tracking-tight text-text-strong lg:block">
            Sign in
          </h2>
          <p className="mt-1 hidden text-sm text-text-dim lg:block">
            Access your terminal and back office
          </p>

          <label className="mt-6 block text-sm font-medium text-text-body lg:mt-8" htmlFor="login-username">
            {isSupabaseEnabled ? "Email" : "Email / username"}
            <input
              id="login-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-text-strong outline-none transition focus:border-accent"
            />
          </label>
          <label className="mt-5 block text-sm font-medium text-text-body" htmlFor="login-password">
            Password
            <input
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-xl border border-line bg-surface-2 px-4 py-3 text-text-strong outline-none transition focus:border-accent"
            />
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger"
              role="alert"
              aria-live="assertive"
            >
              {error}
            </motion.p>
          )}

          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="mt-8 w-full"
          >
            {pending ? "Signing in…" : "Sign in"}
          </Button>
          <p className="mt-6 text-center text-xs text-text-dim">
            {isSupabaseEnabled
              ? "Grabber Mobility Solutions (Pvt) Ltd"
              : "Demo mode — admin / admin123"}
          </p>
          <p className="mt-3 text-center text-xs text-text-dim lg:hidden">
            <Link href="/welcome" className="text-accent hover:underline">
              Product overview
            </Link>
          </p>
        </motion.form>
      </section>
    </main>
  );
}
