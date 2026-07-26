import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { placeStorefrontOrder } from "@/lib/server/storefront-repo";

/**
 * Public order placement for the storefront.
 *
 * This exists so the shop page never has to call `/api/sales`, which requires a
 * staff session — an anonymous shopper posting there gets a 401. Opening
 * `/api/sales` to the public instead would let anyone create sales and move
 * inventory, so orders come through here and are validated independently.
 *
 * Only product ids and quantities are accepted. Prices, discounts, stock and
 * totals are resolved inside `storefront_create_order`, so nothing a shopper can
 * edit in the browser affects what they are charged.
 */
const orderSchema = z.object({
  customerName: z.string().trim().min(2, "Name is required").max(120),
  customerMobile: z.string().trim().min(7, "A contact number is required").max(40),
  address: z.string().trim().min(5, "Delivery address is required").max(500),
  clientUuid: z.string().trim().min(8).max(64),
  lines: z
    .array(
      z.object({
        productId: z.string().trim().min(1),
        quantity: z.number().int().positive().max(999),
      }),
    )
    .min(1, "Your cart is empty")
    .max(100, "Too many items in one order"),
});

/**
 * Small in-memory throttle. Enough to blunt casual abuse of a public write
 * endpoint; a shared store would be needed to make it hold across instances.
 */
const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 8;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now > entry.resetAt) {
    hits.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_PER_WINDOW;
}

function clientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function fail(error: string, status: number) {
  return NextResponse.json({ success: false, data: null, error }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;

  if (rateLimited(clientIp(req))) {
    return fail("Too many orders from this connection. Please try again shortly.", 429);
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid request", 400);
  }

  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid order", 400);
  }

  try {
    const order = await placeStorefrontOrder(
      { host: req.headers.get("host"), slug },
      parsed.data,
    );
    return NextResponse.json({ success: true, data: order, error: null });
  } catch (error) {
    // Stock, availability and storefront errors are all client-correctable.
    const message = error instanceof Error ? error.message : "Order could not be placed";
    return fail(cleanMessage(message), 422);
  }
}

/** Strip the RPC's `CODE: ` prefixes so shoppers see plain language. */
function cleanMessage(message: string): string {
  const known = /^(PRODUCT|STOCK|ORDER|STOREFRONT|QTY|CASH|SALE|BRANCH|AUTH):\s*/;
  if (!known.test(message)) return "Order could not be placed. Please try again.";
  const text = message.replace(known, "");
  return text.charAt(0).toUpperCase() + text.slice(1);
}
