/** Offset (ms) of a time zone from UTC at a given instant: local = utc + offset. */
function tzOffsetMs(ts: number, tz: string): number {
  const whole = ts - (((ts % 1000) + 1000) % 1000);
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(new Date(whole));
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value);
  const asUtc = Date.UTC(get("year"), get("month") - 1, get("day"), get("hour"), get("minute"), get("second"));
  return asUtc - whole;
}

/** Convert a wall-clock time in a time zone ("2026-10-20", 14:30, "Africa/Lagos") to a UTC Date. */
export function zonedToUtc(date: string, hh: number, mm: number, tz: string): Date {
  const [y, m, d] = date.split("-").map(Number);
  const guess = Date.UTC(y, m - 1, d, hh, mm);
  const off1 = tzOffsetMs(guess, tz);
  let t = guess - off1;
  const off2 = tzOffsetMs(t, tz);
  if (off2 !== off1) t = guess - off2;
  return new Date(t);
}

export function fmtTime(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).format(new Date(iso));
}

export function fmtDay(iso: string, tz: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(iso));
}

export function fmtDuration(min: number): string {
  const m = Math.max(0, Math.round(min));
  const h = Math.floor(m / 60);
  const r = m % 60;
  if (h === 0) return `${r}m`;
  return r === 0 ? `${h}h` : `${h}h ${r}m`;
}
