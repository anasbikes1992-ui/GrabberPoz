import { NextRequest, NextResponse } from "next/server";
import {
  getOrder,
  addItem,
  setQty,
  removeItem,
  markSent,
  clearOrder,
} from "@/lib/server/restaurant-store";
import { getRepository } from "@/lib/server/repositories";
import { printTicket } from "@/lib/server/ticket-printer";
import type { TicketStation } from "@/lib/types";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const { tableId } = await params;
  const order = await getOrder(tableId);
  return NextResponse.json({ success: true, data: order, error: null });
}

interface ActionBody {
  action: "addItem" | "setQty" | "remove" | "send" | "settle";
  productId?: string;
  quantity?: number;
  station?: TicketStation;
  paymentMethod?: "cash" | "card" | "wholesale";
  cashReceived?: number;
}

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, data: null, error }, { status });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ tableId: string }> },
) {
  const { tableId } = await params;

  let body: ActionBody;
  try {
    body = await req.json();
  } catch {
    return fail("Invalid JSON body");
  }

  try {
    switch (body.action) {
      case "addItem": {
        if (!body.productId) return fail("productId is required");
        const order = await addItem(tableId, body.productId, body.quantity ?? 1);
        return NextResponse.json({ success: true, data: order, error: null });
      }
      case "setQty": {
        if (!body.productId) return fail("productId is required");
        const order = await setQty(tableId, body.productId, body.quantity ?? 0);
        return NextResponse.json({ success: true, data: order, error: null });
      }
      case "remove": {
        if (!body.productId) return fail("productId is required");
        const order = await removeItem(tableId, body.productId);
        return NextResponse.json({ success: true, data: order, error: null });
      }
      case "send": {
        const station: TicketStation = body.station === "BOT" ? "BOT" : "KOT";
        const { order, sent } = await markSent(tableId);
        if (sent.length === 0) {
          return fail("Nothing new to send");
        }
        const text = sent.map((s) => `${s.quantity} x ${s.name}`).join("\n");
        const print = await printTicket(
          station,
          `Table ${tableId}\n${text}`,
        );
        return NextResponse.json({
          success: true,
          data: {
            order,
            sent,
            station,
            printed: print.success,
            printMessage: print.message,
          },
          error: null,
        });
      }
      case "settle": {
        const order = await getOrder(tableId);
        if (!order || order.lines.length === 0) {
          return fail("No open order for this table");
        }
        const repo = await getRepository();
        const sale = await repo.createSale({
          lines: order.lines.map((l) => ({
            productId: l.productId,
            quantity: l.quantity,
            discount: 0,
          })),
          paymentMethod: body.paymentMethod ?? "cash",
          cashReceived: body.cashReceived,
        });
        await clearOrder(tableId);
        return NextResponse.json({ success: true, data: sale, error: null });
      }
      default:
        return fail("Unknown action");
    }
  } catch (error) {
    return fail(error instanceof Error ? error.message : "Action failed", 422);
  }
}
