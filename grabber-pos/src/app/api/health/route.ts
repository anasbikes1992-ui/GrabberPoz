import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { getRepository } from "@/lib/server/repositories";

/**
 * Liveness + readiness probe. `ready` is true only when the active data
 * backend actually answers a query (fail-closed for load balancers / CI).
 */
export async function GET() {
  const backend = isSupabaseEnabled ? "supabase" : "local";
  let ready = false;
  let detail: string | null = null;

  try {
    const repo = await getRepository();
    await repo.salesStats();
    ready = true;
  } catch (error) {
    detail = error instanceof Error ? error.message : "unknown";
  }

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      ready,
      backend,
      detail,
      version: process.env.npm_package_version ?? "0.0.0",
      time: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
