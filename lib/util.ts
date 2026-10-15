/**
 * Deterministic pseudo-random number in [0, 1) from a string seed.
 * Same seed -> same number, so demo data stays stable between requests
 * (a flight's delay does not change every time you refresh).
 */
export function hash01(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  h ^= h >>> 13;
  h = Math.imul(h, 0x5bd1e995);
  h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}

export function pick<T>(items: T[], seed: string): T {
  return items[Math.floor(hash01(seed) * items.length)];
}

export function startOfUTCDay(ms: number): number {
  const d = new Date(ms);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate());
}
