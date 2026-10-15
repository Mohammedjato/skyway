import type { FlightState, FlightStatusInfo } from "./types";

/**
 * Live data from AviationStack (https://aviationstack.com).
 * The free plan only supports plain http, which is fine here because
 * this code runs on the server, never in the browser.
 */
const BASE = "http://api.aviationstack.com/v1/flights";

interface AvTime {
  airport?: string | null;
  iata?: string | null;
  terminal?: string | null;
  gate?: string | null;
  delay?: number | null;
  scheduled?: string | null;
  estimated?: string | null;
  actual?: string | null;
}

interface AvFlight {
  flight_status?: string;
  departure: AvTime;
  arrival: AvTime;
  airline?: { name?: string; iata?: string };
  flight?: { iata?: string; number?: string };
}

function mapState(f: AvFlight, delay: number): FlightState {
  switch (f.flight_status) {
    case "active": return "in_air";
    case "landed": return "landed";
    case "cancelled": return "cancelled";
    case "diverted": return "diverted";
    case "incident": return "diverted";
    default: return delay >= 15 ? "delayed" : "scheduled";
  }
}

function toStatus(f: AvFlight): FlightStatusInfo | null {
  const dep = f.departure;
  const arr = f.arrival;
  if (!dep?.scheduled || !arr?.scheduled || !dep.iata || !arr.iata) return null;

  const delay = Math.max(arr.delay ?? dep.delay ?? 0, 0);
  const schedDep = Date.parse(dep.scheduled);
  const schedArr = Date.parse(arr.scheduled);
  const estDep = Date.parse(dep.actual ?? dep.estimated ?? dep.scheduled);
  const estArr = Date.parse(arr.actual ?? arr.estimated ?? arr.scheduled);
  const state = mapState(f, delay);
  const now = Date.now();

  const progress =
    state === "landed" ? 1
    : state === "in_air" && estArr > estDep ? Math.min(1, Math.max(0, (now - estDep) / (estArr - estDep)))
    : 0;

  return {
    flightNumber: f.flight?.iata ?? `${f.airline?.iata ?? ""}${f.flight?.number ?? ""}`,
    airline: f.airline?.name ?? "Unknown airline",
    from: dep.iata,
    to: arr.iata,
    scheduledDeparture: new Date(schedDep).toISOString(),
    scheduledArrival: new Date(schedArr).toISOString(),
    estimatedDeparture: new Date(estDep).toISOString(),
    estimatedArrival: new Date(estArr).toISOString(),
    delayMinutes: delay,
    state,
    terminal: arr.terminal ?? null,
    gate: arr.gate ?? null,
    progress,
  };
}

async function call(params: Record<string, string>, key: string): Promise<FlightStatusInfo[]> {
  const url = new URL(BASE);
  url.searchParams.set("access_key", key);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, v);

  const res = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`AviationStack HTTP ${res.status}`);
  const json = (await res.json()) as { data?: AvFlight[]; error?: { message?: string } };
  if (json.error) throw new Error(json.error.message ?? "AviationStack error");
  return (json.data ?? []).map(toStatus).filter((x): x is FlightStatusInfo => x !== null);
}

export function liveArrivals(airport: string, key: string) {
  return call({ arr_iata: airport, limit: "40" }, key);
}

export function liveFlight(flightIata: string, key: string) {
  return call({ flight_iata: flightIata, limit: "5" }, key);
}
