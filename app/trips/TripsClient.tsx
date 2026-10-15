"use client";

import { useState } from "react";
import { StatusCard } from "@/components/StatusBits";
import { getAirport } from "@/lib/airports";
import { fmtMoney } from "@/lib/format";
import { usePolling } from "@/lib/usePolling";
import type { Booking, DataSource, FlightStatusInfo } from "@/lib/types";

export default function TripsClient({ initialPnr, initialEmail }: { initialPnr: string; initialEmail: string }) {
  const [pnr, setPnr] = useState(initialPnr);
  const [email, setEmail] = useState(initialEmail);
  const [lookup, setLookup] = useState(initialPnr && initialEmail ? { pnr: initialPnr, email: initialEmail } : null);

  // The booking itself never changes, so poll it very rarely.
  const trip = usePolling<{ booking: Booking }>(
    lookup ? `/api/bookings?pnr=${encodeURIComponent(lookup.pnr)}&email=${encodeURIComponent(lookup.email)}` : null,
    10 * 60_000
  );
  const booking = trip.data?.booking;

  // The flight status changes, so poll it every 30 seconds.
  const statusUrl = booking
    ? `/api/status?flight=${booking.flight.flightNumber}&from=${booking.flight.from}&to=${booking.flight.to}&date=${booking.flight.departISO.slice(0, 10)}`
    : null;
  const status = usePolling<{ source: DataSource; flight: FlightStatusInfo | null; note?: string }>(statusUrl, 30_000);

  return (
    <div className="stack">
      <div className="hero">
        <h1>My trips</h1>
        <p className="muted">Look up a booking to see live status for your flight.</p>
      </div>

      <form className="card row gap wrap" onSubmit={(e) => { e.preventDefault(); setLookup({ pnr: pnr.trim(), email: email.trim() }); }}>
        <label className="field"><span>Booking reference</span>
          <input value={pnr} onChange={(e) => setPnr(e.target.value.toUpperCase())} maxLength={6} placeholder="ABC234" required />
        </label>
        <label className="field grow"><span>Email</span>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </label>
        <button className="btn">Find trip</button>
      </form>

      {trip.error && <p className="error" role="alert">{trip.error}</p>}

      {booking && (
        <>
          <section className="card">
            <p className="eyebrow">{booking.pnr}</p>
            <h2>{getAirport(booking.flight.from)?.city} → {getAirport(booking.flight.to)?.city}</h2>
            <p className="muted">
              {booking.passengers.map((p) => `${p.firstName} ${p.lastName}`).join(", ")} · {fmtMoney(booking.totalPrice, booking.flight.currency)}
            </p>
          </section>
          {status.data?.note && <p className="muted small">{status.data.note}</p>}
          {status.data?.flight && <StatusCard f={status.data.flight} source={status.data.source} />}
          {status.data && !status.data.flight && <p className="muted">No live status available for this flight yet.</p>}
        </>
      )}
    </div>
  );
}
