import { NextRequest, NextResponse } from "next/server";
import { printTicket } from "@/lib/server/ticket-printer";
import type { TicketStation } from "@/lib/types";

const STATIONS: TicketStation[] = ["KOT", "BOT", "RECEIPT"];
const MAX_CONTENT_LENGTH = 4000;

export async function POST(req: NextRequest) {
  let body: { station?: string; content?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const station = body.station as TicketStation;
  if (!STATIONS.includes(station)) {
    return NextResponse.json(
      { success: false, data: null, error: "station must be KOT, BOT or RECEIPT" },
      { status: 400 },
    );
  }
  const content = String(body.content ?? "").slice(0, MAX_CONTENT_LENGTH);
  if (!content.trim()) {
    return NextResponse.json(
      { success: false, data: null, error: "content is required" },
      { status: 400 },
    );
  }

  const result = await printTicket(station, content);
  return NextResponse.json(
    { success: result.success, data: null, error: result.success ? null : result.message },
    { status: result.success ? 200 : 502 },
  );
}
