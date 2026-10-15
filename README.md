# Skyway

Flight booking site with a real-time flight tracker and arrivals board.
Next.js 15 (App Router) · React 19 · TypeScript.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

## Real flight data (optional)

Without a key the app runs in **demo mode** (simulated flights, delays and arrivals; badge says "Demo data").

1. Get a free key at https://aviationstack.com
2. `cp .env.example .env.local` and set `AVIATIONSTACK_KEY=...`
3. Restart. The badge switches to "Live data". If the live call fails, the app falls back to demo data and says so.

## How it works

| Piece | File |
| --- | --- |
| Fare search (simulated) | `lib/demo.ts` → `app/api/search` |
| Booking + reference (PNR) | `app/api/bookings`, `lib/bookings.ts` |
| Live status & arrivals | `lib/flights.ts` (live vs demo switch), `lib/aviationstack.ts` |
| "Real-time" updates | `lib/usePolling.ts` refetches every 30 s |
| Pages | `/` book · `/track` tracker + arrivals board · `/trips` booking lookup |

## Before going to production

- **Fares are simulated.** For real prices use a flight-offers API (e.g. Amadeus Self-Service) inside `searchFlights`.
- **Payments:** none. Add Stripe Checkout before confirming bookings.
- **Storage:** bookings go to `data/bookings.json`. Serverless hosts have a read-only disk, so swap `lib/bookings.ts` for a database.
- AviationStack's free plan has a low monthly request cap; raise `REFRESH_MS`, or cache responses on the server.
