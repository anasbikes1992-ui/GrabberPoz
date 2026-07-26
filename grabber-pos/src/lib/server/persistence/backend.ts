import "server-only";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { createServerSupabase } from "@/lib/supabase/server";

export type Db = Awaited<ReturnType<typeof createServerSupabase>>;

/**
 * Resolve the persistence backend for this request.
 *
 * Returns a request-scoped Supabase client when Supabase is configured AND the
 * caller is authenticated; otherwise `null`, meaning "use the local JSON store".
 * Org scoping is handled by the tables themselves (`org_id default
 * current_org_id()` + RLS), so no branch lookup is needed here.
 */
export async function resolveDb(): Promise<Db | null> {
  if (!isSupabaseEnabled) return null;
  try {
    const db = await createServerSupabase();
    const {
      data: { user },
    } = await db.auth.getUser();
    return user ? db : null;
  } catch {
    // Misconfigured env or unreachable auth — fail soft to the local store
    // rather than taking the whole module down.
    return null;
  }
}
