import { NextRequest, NextResponse } from "next/server";
import { isSupabaseEnabled } from "@/lib/supabase/config";

const DEMO_COOKIE = "pos_session";
const PUBLIC_PATHS = [
  "/login",
  "/api/auth/login",
  "/api/health",
  "/store",
  "/api/store",
  "/sitemap.xml",
  "/robots.txt",
];

/**
 * Optimistic auth guard (per Next.js guidance, real authorization lives in the
 * data layer via Supabase RLS). Accepts a Supabase session cookie
 * (`sb-*-auth-token`), or the local demo cookie when Supabase is unconfigured.
 *
 * Once Supabase is configured the demo cookie is ignored, so a session minted
 * before the switch can't keep authorizing requests in production.
 */
export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/" || PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasSupabaseSession = req.cookies
    .getAll()
    .some((c) => c.name.startsWith("sb-") && c.name.endsWith("-auth-token"));
  const hasDemoSession =
    !isSupabaseEnabled && Boolean(req.cookies.get(DEMO_COOKIE)?.value);

  if (!hasSupabaseSession && !hasDemoSession) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { success: false, data: null, error: "Unauthorized" },
        { status: 401 },
      );
    }
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.png$).*)"],
};
