"use client";

import { useEffect, useState } from "react";
import AirportSelect from "@/components/AirportSelect";
import { SourceTag, StatusBadge, StatusCard } from "@/components/StatusBits";
import { fmtTime } from "@/lib/format";
import { getAirport } from "@/lib/airports";
import { usePolling } from "@/lib/usePolling";
import type { DataSource, FlightStatusInfo } from "@/lib/types";

const REFRESH_MS = 30_000;

export default function TrackerClient({ initialFlight }: { initialFlight: string }) {
  // ---- Look up one flight ----
  const [input, setInput] = useState(initialFlight);
  const [query, setQuery] = useState(initialFlight);
  const one = usePolling<{ source: DataSource; flight: FlightStatusInfo | null; note?: string }>(
    query ? `/api/status?flight=${encodeURIComponent(query)}` : null,
    REFRESH_MS
  );

  // ---- Arrivals board ----
  const [airport, setAirport] = useState("LOS");
  const board = usePolling<{
    source: DataSource;
    flights: FlightStatusInfo[];
    note?: string;
  }>(`/api/arrivals?airport=${airport}`, REFRESH_MS);

  const [picked, setPicked] = useState<FlightStatusInfo | null>(null);
  const [filter, setFilter] = useState<"all" | "delayed" | "landed">("all");

  const rows = (board.data?.flights ?? []).filter((f) =>
    filter === "all" ? true
    : filter === "landed" ? f.state === "landed"
    : f.delayMinutes >= 15 || f.state === "delayed" || f.state === "cancelled"
  );

  const delayedCount = (board.data?.flights ?? []).filter((f) => f.delayMinutes >= 15).length;

  return (
    <div className="stack">
      <div className="hero">
        <h1>Track a flight</h1>
        <p className="muted">Enter a flight number, or watch the arrivals board for any airport. Updates every 30 seconds.</p>
      </div>

      <form
        className="card row gap wrap"
        onSubmit={(e) => {
          e.preventDefault();
          setQuery(input.trim());
        }}
      >
        <label className="field grow"><span>Flight number</span>
          <input value={input} placeholder="e.g. BA74 or EK783" onChange={(e) => setInput(e.target.value)} />
        </label>
        <button className="btn" disabled={!input.trim()}>Track</button>
      </form>

      {one.error && <p className="error" role="alert">{one.error}</p>}
      {one.data?.note && <p className="muted small">{one.data.note}</p>}
      {one.data?.flight && <StatusCard f={one.data.flight} source={one.data.source} />}
      {one.data && !one.data.flight && <p className="muted">No flight found.</p>}

      <section className="card">
        <div className="row between wrap gap">
          <div className="row gap wrap">
            <AirportSelect id="board" label="Arrivals at" value={airport} onChange={(c) => { setAirport(c); setPicked(null); }} />
            <label className="field"><span>Show</span>
              <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
                <option value="all">All flights</option>
                <option value="delayed">Delayed / cancelled</option>
                <option value="landed">Landed</option>
              </select>
            </label>
          </div>
          <div className="stack-tight right-sm">
            {board.data && <SourceTag source={board.data.source} />}
            <span className="muted small" aria-live="polite">
              {board.updatedAt ? `Updated ${board.updatedAt.toLocaleTimeString()}` : "Loading…"}
              {board.loading && " · refreshing"}
            </span>
            <button className="link small" onClick={board.refresh}>Refresh now</button>
          </div>
        </div>

        {board.data && (
          <p className="muted small">
            {board.data.flights.length} flights · {delayedCount} delayed 15+ min
          </p>
        )}
        {board.data?.note && <p className="muted small">{board.data.note}</p>}
        {board.error && <p className="error">{board.error}</p>}

        <div className="table-scroll">
          <table className="board">
            <thead>
              <tr><th>Time</th><th>Flight</th><th>From</th><th>Status</th><th>Gate</th></tr>
            </thead>
            <tbody>
              {rows.map((f) => (
                <tr key={`${f.flightNumber}-${f.scheduledArrival}`} onClick={() => setPicked(f)} className={picked?.flightNumber === f.flightNumber ? "picked" : ""}>
                  <td>
                    <strong>{fmtTime(f.estimatedArrival, f.to)}</strong>
                    {f.delayMinutes >= 5 && <span className="strike small"> {fmtTime(f.scheduledArrival, f.to)}</span>}
                  </td>
                  <td>{f.flightNumber}<div className="muted small">{f.airline}</div></td>
                  <td>{getAirport(f.from)?.city ?? f.from} <span className="muted small">{f.from}</span></td>
                  <td><StatusBadge f={f} /></td>
                  <td>{f.gate ?? "—"}</td>
                </tr>
              ))}
              {board.data && rows.length === 0 && (
                <tr><td colSpan={5} className="muted">Nothing to show for this filter.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      {picked && board.data && <StatusCard f={board.data.flights.find((f) => f.flightNumber === picked.flightNumber && f.scheduledArrival === picked.scheduledArrival) ?? picked} source={board.data.source} />}
    </div>
  );
}
