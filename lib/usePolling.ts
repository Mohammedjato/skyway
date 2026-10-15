"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Fetches `url` immediately and then again every `intervalMs`.
 * Pass null to pause. This is what makes the tracker "real-time":
 * the page quietly re-asks the server for fresh data on a timer.
 */
export function usePolling<T>(url: string | null, intervalMs = 30_000) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const urlRef = useRef(url);
  urlRef.current = url;

  const load = useCallback(async () => {
    const current = urlRef.current;
    if (!current) return;
    setLoading(true);
    try {
      const res = await fetch(current, { cache: "no-store" });
      const json = await res.json();
      if (urlRef.current !== current) return; // a newer request replaced this one
      if (!res.ok) {
        setError(json.error ?? "Something went wrong.");
        setData(null);
      } else {
        setError(null);
        setData(json as T);
        setUpdatedAt(new Date());
      }
    } catch {
      setError("Network error. Retrying…");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!url) {
      setData(null);
      setError(null);
      return;
    }
    load();
    const id = setInterval(load, intervalMs);
    return () => clearInterval(id);
  }, [url, intervalMs, load]);

  return { data, error, loading, updatedAt, refresh: load };
}
