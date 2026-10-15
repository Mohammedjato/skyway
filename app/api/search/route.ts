import { NextRequest, NextResponse } from "next/server";
import { getAirport } from "@/lib/airports";
import { searchFlights } from "@/lib/demo";

export const dynamic = "force-dynamic";

export function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const from = (p.get("from") ?? "").toUpperCase();
  const to = (p.get("to") ?? "").toUpperCase();
  const date = p.get("date") ?? "";

  if (!getAirport(from) || !getAirport(to)) {
    return NextResponse.json({ error: "Choose valid origin and destination airports." }, { status: 400 });
  }
  if (from === to) {
    return NextResponse.json({ error: "Origin and destination must be different." }, { status: 400 });
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    return NextResponse.json({ error: "Choose a travel date." }, { status: 400 });
  }
  return NextResponse.json({ flights: searchFlights(from, to, date) });
}
