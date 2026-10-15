import { NextRequest, NextResponse } from "next/server";
import { findBooking, newPnr, saveBooking } from "@/lib/bookings";
import { findFlightById } from "@/lib/demo";
import type { Booking, Passenger } from "@/lib/types";

export const dynamic = "force-dynamic";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function POST(req: NextRequest) {
  let body: { flightId?: string; email?: string; passengers?: Passenger[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Never trust the price from the browser: rebuild the flight on the server.
  const flight = body.flightId ? findFlightById(body.flightId) : undefined;
  if (!flight) return NextResponse.json({ error: "That flight is no longer available." }, { status: 404 });

  const email = (body.email ?? "").trim();
  if (!EMAIL.test(email)) return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });

  const passengers = (body.passengers ?? []).map((p) => ({
    firstName: String(p.firstName ?? "").trim(),
    lastName: String(p.lastName ?? "").trim(),
  }));
  if (passengers.length < 1 || passengers.length > 9) {
    return NextResponse.json({ error: "Book between 1 and 9 passengers." }, { status: 400 });
  }
  if (passengers.some((p) => !p.firstName || !p.lastName)) {
    return NextResponse.json({ error: "Enter first and last name for every passenger." }, { status: 400 });
  }
  if (passengers.length > flight.seatsLeft) {
    return NextResponse.json({ error: `Only ${flight.seatsLeft} seats left.` }, { status: 409 });
  }

  const booking: Booking = {
    pnr: await newPnr(),
    email,
    createdAt: new Date().toISOString(),
    passengers,
    flight,
    totalPrice: flight.price * passengers.length,
  };
  await saveBooking(booking);
  return NextResponse.json({ booking }, { status: 201 });
}

export async function GET(req: NextRequest) {
  const pnr = req.nextUrl.searchParams.get("pnr") ?? "";
  const email = (req.nextUrl.searchParams.get("email") ?? "").trim().toLowerCase();
  const booking = pnr ? await findBooking(pnr) : undefined;
  // Require the email too, so a guessed reference alone reveals nothing.
  if (!booking || booking.email.toLowerCase() !== email) {
    return NextResponse.json({ error: "No booking found for that reference and email." }, { status: 404 });
  }
  return NextResponse.json({ booking });
}
