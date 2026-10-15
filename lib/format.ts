import { getAirport } from "./airports";
import type { FlightState } from "./types";

/** Show a time in the airport's own local time zone, e.g. "14:35". */
export function fmtTime(iso: string, airportCode: string): string {
  const tz = getAirport(airportCode)?.tz ?? "UTC";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", timeZone: tz }).format(new Date(iso));
}

export function fmtDay(iso: string, airportCode: string): string {
  const tz = getAirport(airportCode)?.tz ?? "UTC";
  return new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: tz }).format(new Date(iso));
}

export function fmtDuration(min: number): string {
  return `${Math.floor(min / 60)}h ${String(min % 60).padStart(2, "0")}m`;
}

export function fmtMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(amount);
}

export const STATE_LABEL: Record<FlightState, string> = {
  scheduled: "On time",
  boarding: "Boarding",
  delayed: "Delayed",
  in_air: "In the air",
  landed: "Landed",
  cancelled: "Cancelled",
  diverted: "Diverted",
};

/** CSS class that colours the badge. */
export function stateTone(state: FlightState, delay: number): "ok" | "warn" | "bad" | "info" {
  if (state === "cancelled" || state === "diverted") return "bad";
  if (state === "delayed" || delay >= 15) return "warn";
  if (state === "in_air" || state === "boarding") return "info";
  return "ok";
}
