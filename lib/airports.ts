import type { Airport } from "./types";

export const AIRPORTS: Airport[] = [
  { code: "LOS", city: "Lagos", name: "Murtala Muhammed Intl", country: "Nigeria", tz: "Africa/Lagos", lat: 6.577, lon: 3.321 },
  { code: "ABV", city: "Abuja", name: "Nnamdi Azikiwe Intl", country: "Nigeria", tz: "Africa/Lagos", lat: 9.006, lon: 7.263 },
  { code: "PHC", city: "Port Harcourt", name: "Port Harcourt Intl", country: "Nigeria", tz: "Africa/Lagos", lat: 5.015, lon: 6.949 },
  { code: "KAN", city: "Kano", name: "Mallam Aminu Kano Intl", country: "Nigeria", tz: "Africa/Lagos", lat: 12.048, lon: 8.525 },
  { code: "ACC", city: "Accra", name: "Kotoka Intl", country: "Ghana", tz: "Africa/Accra", lat: 5.605, lon: -0.167 },
  { code: "NBO", city: "Nairobi", name: "Jomo Kenyatta Intl", country: "Kenya", tz: "Africa/Nairobi", lat: -1.319, lon: 36.927 },
  { code: "ADD", city: "Addis Ababa", name: "Bole Intl", country: "Ethiopia", tz: "Africa/Addis_Ababa", lat: 8.978, lon: 38.799 },
  { code: "JNB", city: "Johannesburg", name: "O. R. Tambo Intl", country: "South Africa", tz: "Africa/Johannesburg", lat: -26.139, lon: 28.246 },
  { code: "CAI", city: "Cairo", name: "Cairo Intl", country: "Egypt", tz: "Africa/Cairo", lat: 30.122, lon: 31.406 },
  { code: "LHR", city: "London", name: "Heathrow", country: "United Kingdom", tz: "Europe/London", lat: 51.47, lon: -0.454 },
  { code: "CDG", city: "Paris", name: "Charles de Gaulle", country: "France", tz: "Europe/Paris", lat: 49.013, lon: 2.55 },
  { code: "AMS", city: "Amsterdam", name: "Schiphol", country: "Netherlands", tz: "Europe/Amsterdam", lat: 52.31, lon: 4.768 },
  { code: "FRA", city: "Frankfurt", name: "Frankfurt Airport", country: "Germany", tz: "Europe/Berlin", lat: 50.033, lon: 8.571 },
  { code: "IST", city: "Istanbul", name: "Istanbul Airport", country: "Türkiye", tz: "Europe/Istanbul", lat: 41.275, lon: 28.752 },
  { code: "DXB", city: "Dubai", name: "Dubai Intl", country: "UAE", tz: "Asia/Dubai", lat: 25.253, lon: 55.366 },
  { code: "DOH", city: "Doha", name: "Hamad Intl", country: "Qatar", tz: "Asia/Qatar", lat: 25.273, lon: 51.608 },
  { code: "SIN", city: "Singapore", name: "Changi", country: "Singapore", tz: "Asia/Singapore", lat: 1.364, lon: 103.991 },
  { code: "JFK", city: "New York", name: "John F. Kennedy Intl", country: "USA", tz: "America/New_York", lat: 40.641, lon: -73.778 },
  { code: "ATL", city: "Atlanta", name: "Hartsfield-Jackson Intl", country: "USA", tz: "America/New_York", lat: 33.64, lon: -84.428 },
  { code: "LAX", city: "Los Angeles", name: "Los Angeles Intl", country: "USA", tz: "America/Los_Angeles", lat: 33.942, lon: -118.408 },
];

const BY_CODE = new Map(AIRPORTS.map((a) => [a.code, a]));

export function getAirport(code: string): Airport | undefined {
  return BY_CODE.get(code.toUpperCase());
}

/** Great-circle distance in km (haversine formula). */
export function distanceKm(a: Airport, b: Airport): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Rough block time in minutes for a non-stop flight. */
export function flightMinutes(from: Airport, to: Airport): number {
  return Math.round((distanceKm(from, to) / 780) * 60) + 30;
}
