/**
 * Central switch for the data backend.
 *
 * When Supabase env vars are present the app uses the durable Supabase
 * system-of-record. Otherwise it falls back to the bundled local JSON store
 * so the project still runs out-of-the-box for evaluation and offline dev.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const isSupabaseEnabled = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY);
