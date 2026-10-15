import { demoArrivals, demoStatusForNumber } from "./demo";
import { liveArrivals, liveFlight } from "./aviationstack";
import type { DataSource, FlightStatusInfo } from "./types";

/**
 * One place that decides: live data if an API key is configured,
 * otherwise (or if the live call fails) simulated demo data.
 * The UI only ever talks to these functions.
 */
const key = () => process.env.AVIATIONSTACK_KEY?.trim() || "";

export async function getFlightStatus(
  flightNumber: string,
  opts: { from?: string; to?: string; date?: string } = {}
): Promise<{ source: DataSource; flight: FlightStatusInfo | null; note?: string }> {
  const fn = flightNumber.toUpperCase().replace(/\s+/g, "");
  if (key()) {
    try {
      const results = await liveFlight(fn, key());
      const sorted = results.sort(
        (a, b) =>
          Math.abs(Date.parse(a.estimatedDeparture) - Date.now()) -
          Math.abs(Date.parse(b.estimatedDeparture) - Date.now())
      );
      if (sorted[0]) return { source: "live", flight: sorted[0] };
      return { source: "live", flight: null, note: "No live flight found with that number." };
    } catch (e) {
      const note = `Live data unavailable (${(e as Error).message}); showing demo data.`;
      return { source: "demo", flight: demoStatusForNumber(fn, opts), note };
    }
  }
  return { source: "demo", flight: demoStatusForNumber(fn, opts) };
}

export async function getArrivals(
  airport: string
): Promise<{ source: DataSource; flights: FlightStatusInfo[]; note?: string }> {
  if (key()) {
    try {
      const flights = await liveArrivals(airport, key());
      flights.sort((a, b) => Date.parse(a.estimatedArrival) - Date.parse(b.estimatedArrival));
      return { source: "live", flights };
    } catch (e) {
      const note = `Live data unavailable (${(e as Error).message}); showing demo data.`;
      return { source: "demo", flights: demoArrivals(airport), note };
    }
  }
  return { source: "demo", flights: demoArrivals(airport) };
}
