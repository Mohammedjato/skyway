/** Flight id: AIRLINE(2)+NUMBER-ORIGIN-DEST-YYYYMMDDHHmm (scheduled departure, UTC). */
export function flightId(
  airlineCode: string,
  number: string,
  from: string,
  to: string,
  dep: Date,
): string {
  const stamp = dep.toISOString().replace(/[-:T]/g, "").slice(0, 12);
  return `${airlineCode}${number}-${from}-${to}-${stamp}`;
}

export interface ParsedFlightId {
  airlineCode: string;
  number: string;
  from: string;
  to: string;
  dep: Date;
}

export function parseFlightId(id: string): ParsedFlightId | null {
  const m = /^([A-Z0-9]{2})(\d{1,4})-([A-Z]{3})-([A-Z]{3})-(\d{4})(\d{2})(\d{2})(\d{2})(\d{2})$/.exec(id);
  if (!m) return null;
  const dep = new Date(Date.UTC(+m[5], +m[6] - 1, +m[7], +m[8], +m[9]));
  if (Number.isNaN(dep.getTime())) return null;
  return { airlineCode: m[1], number: m[2], from: m[3], to: m[4], dep };
}

/** "ha 412" -> { code: "HA", number: "412" } */
export function parseFlightNumber(input: string): { code: string; number: string } | null {
  const m = /^([A-Z0-9]{2})\s?(\d{1,4})$/.exec(input.trim().toUpperCase());
  return m ? { code: m[1], number: String(Number(m[2])) } : null;
}
