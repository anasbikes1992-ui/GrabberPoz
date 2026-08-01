import { NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";
import { getRepository } from "@/lib/server/repositories";
import { readTenant } from "@/lib/server/tenant-store";
import { isLicenseExpired } from "@/lib/plans";
import { isWhatsAppConfigured } from "@/lib/server/whatsapp";

/**
 * Liveness + readiness probe. `ready` is true only when the active data
 * backend actually answers a query (fail-closed for load balancers / CI).
 * Extra probes (licence, printers, WhatsApp) are informational and never
 * flip the ready flag.
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

  let licence: {
    plan: string;
    expiry: string;
    expired: boolean;
  } | null = null;
  let licenceOk = false;
  try {
    const tenant = await readTenant();
    const expired = isLicenseExpired(tenant.license.expiry);
    licence = {
      plan: tenant.license.plan,
      expiry: tenant.license.expiry,
      expired,
    };
    licenceOk = !expired;
  } catch {
    licence = null;
    licenceOk = false;
  }

  const printers = {
    kot: Boolean(process.env.PRINTER_KOT_IP),
    bot: Boolean(process.env.PRINTER_BOT_IP),
    receipt: Boolean(process.env.PRINTER_RECEIPT_IP),
  };
  const hasPrinterEnv = printers.kot || printers.bot || printers.receipt;
  const hasWhatsapp = isWhatsAppConfigured();

  return NextResponse.json(
    {
      status: ready ? "ok" : "degraded",
      ready,
      backend,
      detail,
      licence,
      licenceOk,
      printers,
      hasPrinterEnv,
      whatsapp: hasWhatsapp,
      hasWhatsapp,
      version: process.env.npm_package_version ?? "0.0.0",
      time: new Date().toISOString(),
    },
    { status: ready ? 200 : 503 },
  );
}
