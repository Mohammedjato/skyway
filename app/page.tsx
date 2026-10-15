"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import AirportSelect from "@/components/AirportSelect";
import { getAirport } from "@/lib/airports";
import { fmtDay, fmtDuration, fmtMoney, fmtTime } from "@/lib/format";
import type { Booking, Flight } from "@/lib/types";

type Step = "search" | "details" | "done";

export default function BookPage() {
  const [from, setFrom] = useState("LOS");
  const [to, setTo] = useState("LHR");
  const [date, setDate] = useState("");
  const [pax, setPax] = useState(1);
  const [today, setToday] = useState("");

  const [flights, setFlights] = useState<Flight[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("search");
  const [selected, setSelected] = useState<Flight | null>(null);
  const [names, setNames] = useState<{ firstName: string; lastName: string }[]>([]);
  const [email, setEmail] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Set dates after mount so server and browser HTML match.
  useEffect(() => {
    const t = new Date();
    setToday(t.toISOString().slice(0, 10));
    t.setDate(t.getDate() + 7);
    setDate(t.toISOString().slice(0, 10));
  }, []);

  async function search(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSearching(true);
    setFlights(null);
    try {
      const res = await fetch(`/api/search?from=${from}&to=${to}&date=${date}`);
      const json = await res.json();
      if (!res.ok) setError(json.error);
      else setFlights(json.flights);
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSearching(false);
    }
  }

  function choose(f: Flight) {
    setSelected(f);
    setNames(Array.from({ length: pax }, () => ({ firstName: "", lastName: "" })));
    setError(null);
    setStep("details");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function book(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ flightId: selected.id, email, passengers: names }),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error);
      else {
        setBooking(json.booking);
        setStep("done");
      }
    } catch {
      setError("Could not reach the server.");
    } finally {
      setSubmitting(false);
    }
  }

  function reset() {
    setStep("search");
    setSelected(null);
    setBooking(null);
    setFlights(null);
  }

  // ---------- Step 3: confirmation ----------
  if (step === "done" && booking) {
    const f = booking.flight;
    return (
      <section className="card confirm">
        <p className="eyebrow">Booking confirmed</p>
        <h1>You’re going to {getAirport(f.to)?.city} 🎉</h1>
        <div className="pnr">{booking.pnr}</div>
        <p className="muted">Save this reference. You’ll need it with <strong>{booking.email}</strong> to find your trip.</p>
        <FlightRow f={f} />
        <ul className="plain">
          {booking.passengers.map((p, i) => (
            <li key={i}>{p.firstName} {p.lastName}</li>
          ))}
        </ul>
        <p><strong>Total paid:</strong> {fmtMoney(booking.totalPrice, f.currency)} <span className="muted small">(demo — no payment taken)</span></p>
        <div className="row gap wrap">
          <Link className="btn" href={`/trips?pnr=${booking.pnr}&email=${encodeURIComponent(booking.email)}`}>Track this flight live</Link>
          <button className="btn ghost" onClick={reset}>Book another</button>
        </div>
      </section>
    );
  }

  // ---------- Step 2: passenger details ----------
  if (step === "details" && selected) {
    const total = selected.price * names.length;
    return (
      <section className="stack">
        <button className="link" onClick={() => setStep("search")}>← Back to results</button>
        <h1>Passenger details</h1>
        <div className="card"><FlightRow f={selected} /></div>
        <form className="card stack" onSubmit={book}>
          {names.map((n, i) => (
            <fieldset key={i} className="grid2">
              <legend>Passenger {i + 1}</legend>
              <label className="field"><span>First name</span>
                <input required value={n.firstName} autoComplete="given-name"
                  onChange={(e) => setNames(names.map((x, j) => (j === i ? { ...x, firstName: e.target.value } : x)))} />
              </label>
              <label className="field"><span>Last name</span>
                <input required value={n.lastName} autoComplete="family-name"
                  onChange={(e) => setNames(names.map((x, j) => (j === i ? { ...x, lastName: e.target.value } : x)))} />
              </label>
            </fieldset>
          ))}
          <label className="field"><span>Contact email</span>
            <input required type="email" value={email} autoComplete="email" onChange={(e) => setEmail(e.target.value)} />
          </label>
          {error && <p className="error" role="alert">{error}</p>}
          <div className="row between wrap">
            <strong className="total">{fmtMoney(total, selected.currency)} <span className="muted small">for {names.length} passenger{names.length > 1 ? "s" : ""}</span></strong>
            <button className="btn" disabled={submitting}>{submitting ? "Booking…" : "Confirm booking"}</button>
          </div>
        </form>
      </section>
    );
  }

  // ---------- Step 1: search ----------
  return (
    <section className="stack">
      <div className="hero">
        <h1>Find your flight. Watch it land.</h1>
        <p className="muted">Book in a minute, then follow delays and arrivals in real time.</p>
      </div>

      <form className="card search" onSubmit={search}>
        <AirportSelect id="from" label="From" value={from} onChange={setFrom} />
        <button type="button" className="swap" aria-label="Swap airports" onClick={() => { setFrom(to); setTo(from); }}>⇄</button>
        <AirportSelect id="to" label="To" value={to} onChange={setTo} />
        <label className="field"><span>Date</span>
          <input id="date" type="date" required min={today} value={date} onChange={(e) => setDate(e.target.value)} />
        </label>
        <label className="field"><span>Passengers</span>
          <select value={pax} onChange={(e) => setPax(Number(e.target.value))}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </label>
        <button className="btn" disabled={searching}>{searching ? "Searching…" : "Search flights"}</button>
      </form>

      {error && <p className="error" role="alert">{error}</p>}

      {flights && flights.length === 0 && <p className="muted">No flights on that day. Try another date.</p>}

      {flights && flights.length > 0 && (
        <div className="stack">
          <h2>{getAirport(from)?.city} → {getAirport(to)?.city} · {flights.length} flights</h2>
          {flights.map((f) => (
            <article key={f.id} className="card flight">
              <FlightRow f={f} />
              <div className="buy">
                <div className="price">{fmtMoney(f.price, f.currency)}</div>
                <div className="muted small">per person{f.seatsLeft <= 5 ? ` · only ${f.seatsLeft} left` : ""}</div>
                <button className="btn" onClick={() => choose(f)}>Select</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function FlightRow({ f }: { f: Flight }) {
  return (
    <div className="flight-row">
      <div className="muted small">{f.airline} · {f.flightNumber} · {fmtDay(f.departISO, f.from)}</div>
      <div className="times">
        <div><div className="time">{fmtTime(f.departISO, f.from)}</div><div className="muted small">{f.from}</div></div>
        <div className="mid">
          <div className="small muted">{fmtDuration(f.durationMin)}</div>
          <div className="bar" />
          <div className="small muted">{f.stops === 0 ? "Non-stop" : `${f.stops} stop`}</div>
        </div>
        <div><div className="time">{fmtTime(f.arriveISO, f.to)}</div><div className="muted small">{f.to}</div></div>
      </div>
    </div>
  );
}
