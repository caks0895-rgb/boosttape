/**
 * ISO-8601 (must start YYYY-MM-DD), unix seconds, or unix milliseconds.
 * Values below 1e12 are treated as seconds.
 */
export function parseSinceMs(raw: string): number | null {
  const t = raw.trim();
  if (!t) return null;
  if (/^\d+(\.\d+)?$/.test(t)) {
    const n = Number(t);
    if (!Number.isFinite(n) || n < 0) return null;
    return n < 1e12 ? Math.round(n * 1000) : Math.round(n);
  }
  if (!/^\d{4}-\d{2}-\d{2}/.test(t)) return null;
  const ms = Date.parse(t);
  return Number.isFinite(ms) ? ms : null;
}
