"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/client";

const FEATURES = [
  { title: "Super Fast", body: "Optimized performance" },
  { title: "More Functional", body: "Next level features" },
  { title: "Smart Analytics", body: "Real-time insights" },
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
        // Production path: Supabase email + password.
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
        // Local demo path.
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
      setError("Could not reach the server");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="flex min-h-screen items-stretch">
      {/* Brand panel */}
      <section className="relative hidden flex-1 flex-col justify-center overflow-hidden px-16 lg:flex">
        <motion.div
          aria-hidden
          className="absolute -top-40 -left-40 h-130 w-130 rounded-full bg-accent/10 blur-3xl"
          animate={{ scale: [1, 1.15, 1], opacity: [0.6, 1, 0.6] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.h1
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl font-semibold tracking-tight text-text-strong"
        >
          GRABBER <span className="text-accent">POS</span> Studio
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.5 }}
          className="mt-3 text-lg text-text-dim"
        >
          By Grabber Mobility Solutions (Pvt) Ltd
        </motion.p>
        <ul className="mt-12 space-y-5">
          {FEATURES.map((f, i) => (
            <motion.li
              key={f.title}
              initial={{ opacity: 0, x: -24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.25 + i * 0.12, duration: 0.5 }}
              className="flex items-center gap-4"
            >
              <span className="h-2 w-2 rounded-full bg-accent" />
              <div>
                <p className="font-medium text-text-strong">{f.title}</p>
                <p className="text-sm text-text-dim">{f.body}</p>
              </div>
            </motion.li>
          ))}
        </ul>
      </section>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-6">
        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 32, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-md rounded-2xl border border-line bg-surface-1 p-8 shadow-2xl"
        >
          <h2 className="text-2xl font-semibold text-text-strong">
            Welcome back
          </h2>
          <p className="mt-1 text-sm text-text-dim">
            Sign in to your dashboard
          </p>

          <label className="mt-8 block text-sm font-medium text-text-body">
            Email / username
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
              className="mt-2 w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-text-strong outline-none transition focus:border-accent"
            />
          </label>
          <label className="mt-5 block text-sm font-medium text-text-body">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
              className="mt-2 w-full rounded-lg border border-line bg-surface-2 px-4 py-3 text-text-strong outline-none transition focus:border-accent"
            />
          </label>

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-lg border border-danger/40 bg-danger/10 px-4 py-2 text-sm text-danger"
              role="alert"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            type="submit"
            disabled={pending}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.985 }}
            className="mt-8 w-full rounded-lg bg-accent py-3 font-semibold text-accent-ink transition hover:bg-accent-strong disabled:opacity-60"
          >
            {pending ? "Signing in…" : "Sign in to dashboard"}
          </motion.button>
          <p className="mt-6 text-center text-xs text-text-dim">
            {isSupabaseEnabled
              ? "Grabber Mobility Solutions (Pvt) Ltd"
              : "Local demo build — default credentials admin / admin123"}
          </p>
        </motion.form>
      </section>
    </main>
  );
}
