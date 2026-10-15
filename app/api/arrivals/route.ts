import { NextRequest, NextResponse } from "next/server";
import { getAirport } from "@/lib/airports";
import { getArrivals } from "@/lib/flights";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const airport = (req.nextUrl.searchParams.get("airport") ?? "").toUpperCase();
  if (!getAirport(airport)) {
    return NextResponse.json({ error: "Unknown airport." }, { status: 400 });
  }
  const result = await getArrivals(airport);
  return NextResponse.json({ ...result, updatedAt: new Date().toISOString() });
}
