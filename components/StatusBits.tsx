import { fmtDay, fmtTime, STATE_LABEL, stateTone } from "@/lib/format";
import { getAirport } from "@/lib/airports";
import type { DataSource, FlightStatusInfo } from "@/lib/types";

export function StatusBadge({ f }: { f: FlightStatusInfo }) {
  const tone = stateTone(f.state, f.delayMinutes);
  const showDelay = f.delayMinutes >= 5 && f.state !== "cancelled";
  return (
    <span className={`badge ${tone}`}>
      {STATE_LABEL[f.state]}
      {showDelay && ` · +${f.delayMinutes}m`}
    </span>
  );
}

export function SourceTag({ source }: { source: DataSource }) {
  return (
    <span className={`source ${source}`} title={source === "live" ? "Real flight data" : "Simulated data. Add an API key for real flights."}>
      <i /> {source === "live" ? "Live data" : "Demo data"}
    </span>
  );
}

/** Big detail card for one flight: route, times, delay, progress bar. */
export function StatusCard({ f, source }: { f: FlightStatusInfo; source: DataSource }) {
  const from = getAirport(f.from);
  const to = getAirport(f.to);
  const depChanged = f.delayMinutes >= 5;
  return (
    <section className="card status-card">
      <header className="row between wrap">
        <div>
          <h2>
            {f.flightNumber} <span className="muted">· {f.airline}</span>
          </h2>
          <p className="muted small">{fmtDay(f.scheduledDeparture, f.from)}</p>
        </div>
        <div className="row gap">
          <StatusBadge f={f} />
          <SourceTag source={source} />
        </div>
      </header>

      <div className="route">
        <div>
          <div className="code">{f.from}</div>
          <div className="muted small">{from?.city ?? f.from}</div>
          <div className="time">{fmtTime(f.estimatedDeparture, f.from)}</div>
          {depChanged && <div className="strike small">{fmtTime(f.scheduledDeparture, f.from)}</div>}
        </div>

        <div className="track" aria-label={`Flight ${Math.round(f.progress * 100)}% complete`}>
          <div className="line">
            <div className="fill" style={{ width: `${f.progress * 100}%` }} />
            <span className="plane" style={{ left: `${f.progress * 100}%` }}>✈</span>
          </div>
          <div className="small muted center">{f.state === "in_air" ? `${Math.round(f.progress * 100)}% of the way` : STATE_LABEL[f.state]}</div>
        </div>

        <div className="right">
          <div className="code">{f.to}</div>
          <div className="muted small">{to?.city ?? f.to}</div>
          <div className="time">{fmtTime(f.estimatedArrival, f.to)}</div>
          {depChanged && <div className="strike small">{fmtTime(f.scheduledArrival, f.to)}</div>}
        </div>
      </div>

      <dl className="facts">
        <div><dt>Delay</dt><dd>{f.state === "cancelled" ? "—" : f.delayMinutes >= 5 ? `${f.delayMinutes} min` : "None"}</dd></div>
        <div><dt>Terminal</dt><dd>{f.terminal ?? "TBA"}</dd></div>
        <div><dt>Gate</dt><dd>{f.gate ?? "TBA"}</dd></div>
      </dl>
      <p className="muted small">Times shown in each airport’s local time.</p>
    </section>
  );
}
