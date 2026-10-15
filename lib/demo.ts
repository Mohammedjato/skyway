import { AIRPORTS, flightMinutes, getAirport, distanceKm } from "./airports";
import type { Flight, FlightState, FlightStatusInfo } from "./types";
import { hash01, pick, startOfUTCDay } from "./util";

export const AIRLINES = [
  { code: "P4", name: "Air Peace" },
  { code: "ET", name: "Ethiopian Airlines" },
  { code: "EK", name: "Emirates" },
  { code: "BA", name: "British Airways" },
  { code: "TK", name: "Turkish Airlines" },
  { code: "LH", name: "Lufthansa" },
  { code: "QR", name: "Qatar Airways" },
  { code: "DL", name: "Delta" },
  { code: "KL", name: "KLM" },
  { code: "AF", name: "Air France" },
  { code: "KQ", name: "Kenya Airways" },
  { code: "MS", name: "EgyptAir" },
];

const MIN = 60_000;
const HOUR = 60 * MIN;

/** Generate bookable flight offers for a route and date (YYYY-MM-DD). Deterministic. */
export function searchFlights(from: string, to: string, date: string): Flight[] {
  const a = getAirport(from);
  const b = getAirport(to);
  if (!a || !b || a.code === b.code) return [];
  const [y, m, d] = date.split("-").map(Number);
  if (!y || !m || !d) return [];

  const km = distanceKm(a, b);
  const hours = [4, 7, 10, 13, 16, 19, 22];
  const flights: Flight[] = [];

  hours.forEach((hour, i) => {
    const seed = `${from}-${to}-${date}-${i}`;
    if (hash01(seed + "skip") < 0.15) return; // not every slot is served
    const airline = pick(AIRLINES, seed + "al");
    const stops = km > 5000 && hash01(seed + "st") < 0.4 ? 1 : 0;
    const durationMin = flightMinutes(a, b) + (stops ? 150 : 0);
    const departMs = Date.UTC(y, m - 1, d, hour, Math.floor(hash01(seed + "mi") * 12) * 5);
    const base = 45 + km * 0.085;
    const price = Math.round(base * (0.8 + hash01(seed + "pr") * 0.7) * (stops ? 0.85 : 1));

    flights.push({
      id: seed,
      airlineCode: airline.code,
      airline: airline.name,
      flightNumber: `${airline.code}${100 + Math.floor(hash01(seed + "fn") * 900)}`,
      from: a.code,
      to: b.code,
      departISO: new Date(departMs).toISOString(),
      arriveISO: new Date(departMs + durationMin * MIN).toISOString(),
      durationMin,
      stops,
      price,
      currency: "USD",
      seatsLeft: 2 + Math.floor(hash01(seed + "se") * 38),
    });
  });

  return flights;
}

export function findFlightById(id: string): Flight | undefined {
  const parts = id.split("-");
  if (parts.length < 6) return undefined; // XXX-YYY-YYYY-MM-DD-i
  const [from, to, y, m, d] = parts;
  return searchFlights(from, to, `${y}-${m}-${d}`).find((f) => f.id === id);
}

interface StatusInput {
  flightNumber: string;
  from: string;
  to: string;
  departMs: number;
  durationMin: number;
  now: number;
}

/**
 * Simulate the live status of a flight. The delay is derived from a hash of the
 * flight, so it is stable. The *state* (scheduled / in air / landed) is derived
 * from the real clock, so it changes as time passes, like a real flight.
 */
export function demoStatus(input: StatusInput): FlightStatusInfo {
  const { flightNumber, from, to, departMs, durationMin, now } = input;
  const seed = `${flightNumber}-${from}-${to}-${Math.floor(departMs / MIN)}`;
  const r = hash01(seed + "delay");
  const delay =
    r < 0.55 ? 0 : r < 0.75 ? 5 + Math.floor(hash01(seed + "d1") * 10)
    : r < 0.92 ? 15 + Math.floor(hash01(seed + "d2") * 45)
    : 60 + Math.floor(hash01(seed + "d3") * 120);
  const cancelled = hash01(seed + "cancel") < 0.04;

  const schedArr = departMs + durationMin * MIN;
  const estDep = departMs + delay * MIN;
  const estArr = schedArr + delay * MIN;

  let state: FlightState;
  if (cancelled) state = "cancelled";
  else if (now >= estArr) state = "landed";
  else if (now >= estDep) state = "in_air";
  else if (estDep - now <= 45 * MIN) state = "boarding";
  else state = delay >= 15 ? "delayed" : "scheduled";

  // A delayed flight that is already flying stays "in_air"; the delay shows separately.
  const progress =
    state === "landed" ? 1
    : state === "in_air" ? Math.min(1, Math.max(0, (now - estDep) / (estArr - estDep)))
    : 0;

  const airlineCode = flightNumber.replace(/[0-9]/g, "");
  return {
    flightNumber,
    airline: AIRLINES.find((a) => a.code === airlineCode)?.name ?? airlineCode,
    from,
    to,
    scheduledDeparture: new Date(departMs).toISOString(),
    scheduledArrival: new Date(schedArr).toISOString(),
    estimatedDeparture: new Date(estDep).toISOString(),
    estimatedArrival: new Date(estArr).toISOString(),
    delayMinutes: cancelled ? 0 : delay,
    state,
    terminal: `T${1 + Math.floor(hash01(seed + "t") * 3)}`,
    gate: `${"ABCDE"[Math.floor(hash01(seed + "gl") * 5)]}${1 + Math.floor(hash01(seed + "gn") * 30)}`,
    progress,
  };
}

/** Status for an arbitrary flight number the user typed in (route is invented from the number). */
export function demoStatusForNumber(
  flightNumber: string,
  opts: { from?: string; to?: string; date?: string },
  now = Date.now()
): FlightStatusInfo {
  const fn = flightNumber.toUpperCase().replace(/\s+/g, "");

  // If the caller knows the route + date (e.g. from a booking), use the real offer's times.
  if (opts.from && opts.to && opts.date) {
    const match = searchFlights(opts.from, opts.to, opts.date).find((f) => f.flightNumber === fn);
    if (match) {
      return demoStatus({
        flightNumber: fn,
        from: match.from,
        to: match.to,
        departMs: Date.parse(match.departISO),
        durationMin: match.durationMin,
        now,
      });
    }
  }

  const fromA = (opts.from && getAirport(opts.from)) || pick(AIRPORTS, fn + "from");
  let toA = (opts.to && getAirport(opts.to)) || pick(AIRPORTS, fn + "to");
  if (toA.code === fromA.code) toA = AIRPORTS[(AIRPORTS.indexOf(toA) + 1) % AIRPORTS.length];

  const duration = flightMinutes(fromA, toA);
  // Spread invented flights across a window around "now" so the demo always has a mix of states.
  const slot = Math.floor(now / (6 * HOUR));
  const departMs = slot * 6 * HOUR + Math.floor(hash01(fn + "dep") * 6 * 12) * 5 * MIN - 2 * HOUR;
  return demoStatus({ flightNumber: fn, from: fromA.code, to: toA.code, departMs, durationMin: duration, now });
}

/** Simulated arrivals board for an airport: a rolling window of flights around the current time. */
export function demoArrivals(airport: string, now = Date.now()): FlightStatusInfo[] {
  const dest = getAirport(airport);
  if (!dest) return [];
  const SLOT = 20 * MIN;
  const n0 = Math.floor(now / SLOT);
  const origins = AIRPORTS.filter((a) => a.code !== dest.code);
  const out: FlightStatusInfo[] = [];

  for (let k = -4; k <= 10; k++) {
    const n = n0 + k;
    const seed = `${dest.code}-arr-${n}`;
    const origin = pick(origins, seed + "o");
    const airline = pick(AIRLINES, seed + "a");
    const duration = flightMinutes(origin, dest);
    const schedArr = n * SLOT + Math.floor(hash01(seed + "j") * 4) * 5 * MIN;
    out.push(
      demoStatus({
        flightNumber: `${airline.code}${100 + Math.floor(hash01(seed + "n") * 900)}`,
        from: origin.code,
        to: dest.code,
        departMs: schedArr - duration * MIN,
        durationMin: duration,
        now,
      })
    );
  }
  return out.sort((a, b) => Date.parse(a.estimatedArrival) - Date.parse(b.estimatedArrival));
}

export { startOfUTCDay };
