import { NextRequest, NextResponse } from "next/server";
import { getFlightStatus } from "@/lib/flights";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const flight = (p.get("flight") ?? "").trim();
  if (!/^[A-Za-z0-9]{2}\s?\d{1,4}[A-Za-z]?$/.test(flight)) {
    return NextResponse.json(
      { error: "Enter a flight number like BA74 or EK783." },
      { status: 400 }
    );
  }
  const result = await getFlightStatus(flight, {
    from: p.get("from")?.toUpperCase() ?? undefined,
    to: p.get("to")?.toUpperCase() ?? undefined,
    date: p.get("date") ?? undefined,
  });
  return NextResponse.json(result);
}
