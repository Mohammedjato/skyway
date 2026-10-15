import { randomInt } from "crypto";
import { promises as fs } from "fs";
import path from "path";
import type { Booking } from "./types";

/**
 * Tiny JSON-file booking store. Perfect for local development and demos.
 * For production, replace these four functions with a real database
 * (Postgres, Supabase, Firestore...) - the API routes won't need to change.
 */

const DIR = process.env.DATA_DIR ?? path.join(process.cwd(), ".data");
const FILE = path.join(DIR, "bookings.json");

let lock: Promise<unknown> = Promise.resolve();
function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const run = lock.then(fn, fn);
  lock = run.catch(() => undefined);
  return run;
}

async function readAll(): Promise<Booking[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
  } catch {
    return [];
  }
}

async function writeAll(bookings: Booking[]): Promise<void> {
  await fs.mkdir(DIR, { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(bookings, null, 2));
}

const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I

function newRef(existing: Set<string>): string {
  for (;;) {
    let ref = "";
    for (let i = 0; i < 6; i++) ref += ALPHABET[randomInt(ALPHABET.length)];
    if (!existing.has(ref)) return ref;
  }
}

export function createBooking(data: Omit<Booking, "ref" | "createdAt" | "status">): Promise<Booking> {
  return withLock(async () => {
    const all = await readAll();
    const booking: Booking = {
      ...data,
      ref: newRef(new Set(all.map((b) => b.ref))),
      createdAt: new Date().toISOString(),
      status: "confirmed",
    };
    all.push(booking);
    await writeAll(all);
    return booking;
  });
}

const sameEmail = (a: string, b: string) => a.trim().toLowerCase() === b.trim().toLowerCase();

/** A booking is only revealed when both the reference and the email match. */
export async function findBooking(ref: string, email: string): Promise<Booking | null> {
  const all = await readAll();
  return all.find((b) => b.ref === ref.toUpperCase() && sameEmail(b.email, email)) ?? null;
}

export function cancelBooking(ref: string, email: string): Promise<Booking | null> {
  return withLock(async () => {
    const all = await readAll();
    const b = all.find((x) => x.ref === ref.toUpperCase() && sameEmail(x.email, email));
    if (!b) return null;
    b.status = "cancelled";
    await writeAll(all);
    return b;
  });
}
