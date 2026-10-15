export interface Airport {
  code: string;
  city: string;
  name: string;
  country: string;
  tz: string; // IANA time zone, used to show local times
  lat: number;
  lon: number;
}

/** A bookable flight offer returned by search. */
export interface Flight {
  id: string; // `${from}-${to}-${date}-${index}` so we can rebuild it when booking
  airlineCode: string;
  airline: string;
  flightNumber: string;
  from: string;
  to: string;
  departISO: string;
  arriveISO: string;
  durationMin: number;
  stops: number;
  price: number;
  currency: string;
  seatsLeft: number;
}

export type FlightState =
  | "scheduled"
  | "boarding"
  | "delayed"
  | "in_air"
  | "landed"
  | "cancelled"
  | "diverted";

/** Live (or simulated) status of one flight. */
export interface FlightStatusInfo {
  flightNumber: string;
  airline: string;
  from: string;
  to: string;
  scheduledDeparture: string;
  scheduledArrival: string;
  estimatedDeparture: string;
  estimatedArrival: string;
  delayMinutes: number;
  state: FlightState;
  terminal: string | null;
  gate: string | null;
  progress: number; // 0..1, how far along the flight is
}

export type DataSource = "live" | "demo";

export interface Passenger {
  firstName: string;
  lastName: string;
}

export interface Booking {
  pnr: string;
  email: string;
  createdAt: string;
  passengers: Passenger[];
  flight: Flight;
  totalPrice: number;
}
