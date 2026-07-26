"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { SETTINGS_SECTIONS } from "@/lib/settings";
import { ModuleHeader } from "@/components/shell/ModuleHeader";

type Form = Record<string, string>;

export default function SettingsPage() {
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((json) => {
        if (json.success) {
          const next: Form = {};
          for (const [k, v] of Object.entries(json.data)) next[k] = String(v ?? "");
          setForm(next);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  function set(key: string, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg(null);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      setMsg(
        json.success
          ? { ok: true, text: "Settings saved." }
          : { ok: false, text: json.error ?? "Save failed" },
      );
    } catch {
      setMsg({ ok: false, text: "Could not reach the server" });
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-8">
        <ModuleHeader title="Settings" subtitle="Business, receipt, tax & printers" />
        <p className="mt-10 text-center text-sm text-text-dim">Loading…</p>
      </div>
    );
  }

  return (
    <form onSubmit={save} className="mx-auto max-w-3xl px-6 py-8">
      <ModuleHeader
        title="Settings"
        subtitle="Business, receipt, tax & printers"
        actions={
          <button
            type="submit"
            disabled={saving}
            className="rounded-lg bg-accent px-5 py-2 text-sm font-semibold text-accent-ink transition hover:bg-accent-strong disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save changes"}
          </button>
        }
      />

      {msg && (
        <p
          className={`mt-6 rounded-lg border px-4 py-2 text-sm ${
            msg.ok
              ? "border-accent/40 bg-accent/10 text-accent"
              : "border-danger/40 bg-danger/10 text-danger"
          }`}
        >
          {msg.text}
        </p>
      )}

      <div className="mt-6 space-y-6">
        {SETTINGS_SECTIONS.map((section, i) => (
          <motion.section
            key={section.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="rounded-xl border border-line bg-surface-1 p-5"
          >
            <h2 className="mb-4 text-sm font-medium text-text-strong">
              {section.label}
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {section.fields.map((f) => (
                <label
                  key={f.key}
                  className={`text-sm ${f.full || f.type === "textarea" ? "col-span-2" : ""}`}
                >
                  <span className="mb-1 block text-text-dim">{f.label}</span>
                  {f.type === "select" ? (
                    <select
                      value={form[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-text-strong outline-none focus:border-accent"
                    >
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : f.type === "textarea" ? (
                    <textarea
                      value={form[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      rows={2}
                      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-text-strong outline-none focus:border-accent"
                    />
                  ) : (
                    <input
                      type={f.type === "number" ? "number" : f.type === "email" ? "email" : "text"}
                      value={form[f.key] ?? ""}
                      onChange={(e) => set(f.key, e.target.value)}
                      className="w-full rounded-lg border border-line bg-surface-2 px-3 py-2 text-text-strong outline-none focus:border-accent"
                    />
                  )}
                </label>
              ))}
            </div>
          </motion.section>
        ))}
      </div>
    </form>
  );
}
