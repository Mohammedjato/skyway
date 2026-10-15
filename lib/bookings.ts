import { promises as fs } from "fs";
import path from "path";
import { randomInt } from "crypto";
import type { Booking } from "./types";

/**
 * Tiny file-based store so the app works with zero setup.
 * On serverless hosts (e.g. Vercel) the disk is read-only, so for production
 * swap these two functions for a real database (Postgres, Supabase, etc.).
 */
const FILE = path.join(process.cwd(), "data", "bookings.json");

async function readAll(): Promise<Booking[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Booking[];
  } catch {
    return [];
  }
}

export async function saveBooking(b: Booking): Promise<void> {
  const all = await readAll();
  all.push(b);
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  await fs.writeFile(FILE, JSON.stringify(all, null, 2));
}

export async function findBooking(pnr: string): Promise<Booking | undefined> {
  const all = await readAll();
  return all.find((b) => b.pnr === pnr.toUpperCase().trim());
}

/** 6-character booking reference without look-alike characters (no 0/O, 1/I). */
export async function newPnr(): Promise<string> {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  for (;;) {
    let pnr = "";
    for (let i = 0; i < 6; i++) pnr += chars[randomInt(chars.length)];
    if (!(await findBooking(pnr))) return pnr;
  }
}
