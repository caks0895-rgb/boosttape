import { DEFAULT_LIMIT, DEFAULT_MIN_LIQ, MAX_LIMIT, MIN_LIMIT } from "./config";
import { computeFlags } from "./flags";
import { parseSinceMs } from "./since";
import { allEvents, pollMeta, storeSize } from "./store.server";
import {
  CHAINS,
  DISCLAIMER,
  EVENT_TYPES,
  type ChainFilter,
  type EventItem,
  type EventTypeFilter,
  type EventsQuery,
  type EventsResponse,
  type HealthResponse,
  type PromoEvent,
  type StoredEvent,
} from "./types";

export { parseSinceMs } from "./since";

const EVENT_PRI: Record<PromoEvent, number> = {
  boost: 0,
  paid: 1,
  profile: 2,
};

export function parseEventsQuery(
  url: URL,
): { ok: true; query: EventsQuery } | { ok: false; error: string } {
  const chainRaw = (url.searchParams.get("chain") ?? "all").toLowerCase();
  const typeRaw = (url.searchParams.get("type") ?? "all").toLowerCase();
  const limitRaw = url.searchParams.get("limit");
  const minLiqRaw = url.searchParams.get("min_liq");
  const sinceRaw =
    url.searchParams.get("since") ??
    url.searchParams.get("since_timestamp") ??
    url.searchParams.get("cursor");

  if (!CHAINS.includes(chainRaw as ChainFilter)) {
    return { ok: false, error: `chain must be one of ${CHAINS.join(", ")}` };
  }
  if (!EVENT_TYPES.includes(typeRaw as EventTypeFilter)) {
    return { ok: false, error: `type must be one of ${EVENT_TYPES.join(", ")}` };
  }

  let limit = DEFAULT_LIMIT;
  if (limitRaw != null && limitRaw !== "") {
    const n = Number(limitRaw);
    if (!Number.isInteger(n) || n < MIN_LIMIT || n > MAX_LIMIT) {
      return { ok: false, error: `limit must be an integer ${MIN_LIMIT}..${MAX_LIMIT}` };
    }
    limit = n;
  }

  let min_liq = DEFAULT_MIN_LIQ;
  if (minLiqRaw != null && minLiqRaw !== "") {
    const n = Number(minLiqRaw);
    if (!Number.isFinite(n) || n < 0) {
      return { ok: false, error: "min_liq must be a number >= 0" };
    }
    min_liq = n;
  }

  let sinceMs: number | null = null;
  if (sinceRaw != null && sinceRaw !== "") {
    const parsed = parseSinceMs(sinceRaw);
    if (parsed == null) {
      return { ok: false, error: "since must be ISO-8601 or unix seconds/ms" };
    }
    sinceMs = parsed;
  }

  return {
    ok: true,
    query: {
      chain: chainRaw as ChainFilter,
      type: typeRaw as EventTypeFilter,
      limit,
      min_liq,
      sinceMs,
    },
  };
}

function toItem(row: StoredEvent, now: number): EventItem {
  const ageMin = Number.isFinite(row.eventAt)
    ? Math.max(0, Math.round((now - row.eventAt) / 60000))
    : null;
  return {
    symbol: row.symbol || shortToken(row.token),
    name: row.name,
    chain: row.chain,
    token: row.token,
    pair: row.pair,
    dexscreener_url: row.dexscreenerUrl,
    event: row.event,
    event_at: Number.isFinite(row.eventAt) ? new Date(row.eventAt).toISOString() : null,
    age_min: ageMin,
    liquidity_usd: row.liquidityUsd,
    volume_24h_usd: row.volume24hUsd,
    price_usd: row.priceUsd,
    change_after: {
      m5: row.changeM5,
      h1: row.changeH1,
      h6: row.changeH6,
    },
    flags: computeFlags({
      event: row.event,
      liquidityUsd: row.liquidityUsd,
      priceUsd: row.priceUsd,
      changeM5: row.changeM5,
      changeH1: row.changeH1,
      pairCreatedAt: row.pairCreatedAt,
      now,
    }),
  };
}

function shortToken(token: string): string {
  if (token.length <= 10) return token;
  return `${token.slice(0, 4)}…${token.slice(-4)}`;
}

export function queryEvents(q: EventsQuery): EventsResponse {
  const now = Date.now();
  let rows = allEvents();
  if (q.chain !== "all") {
    rows = rows.filter((r) => r.chain === q.chain);
  }
  if (q.type !== "all") {
    rows = rows.filter((r) => r.event === q.type);
  }
  rows = rows.filter((r) => r.liquidityUsd == null || r.liquidityUsd >= q.min_liq);

  let picked: StoredEvent[];
  if (q.sinceMs == null) {
    rows.sort((a, b) => b.eventAt - a.eventAt || EVENT_PRI[a.event] - EVENT_PRI[b.event]);
    const seen = new Set<string>();
    picked = [];
    for (const row of rows) {
      const tokenKey = `${row.chain}:${row.token.toLowerCase()}`;
      if (seen.has(tokenKey)) continue;
      seen.add(tokenKey);
      picked.push(row);
      if (picked.length >= q.limit) break;
    }
  } else {
    rows = rows.filter((r) => Number.isFinite(r.eventAt) && r.eventAt > q.sinceMs!);
    rows.sort(
      (a, b) =>
        a.eventAt - b.eventAt || EVENT_PRI[a.event] - EVENT_PRI[b.event] || a.key.localeCompare(b.key),
    );
    picked = rows.slice(0, q.limit);
  }

  const items = picked.map((r) => toItem(r, now));
  const asOf = new Date(now).toISOString();
  const sinceIso = q.sinceMs == null ? null : new Date(q.sinceMs).toISOString();
  let nextSince = asOf;
  if (q.sinceMs != null) {
    const last = picked[picked.length - 1];
    nextSince = last ? new Date(last.eventAt).toISOString() : sinceIso!;
  }

  return {
    as_of: asOf,
    since: sinceIso,
    next_since: nextSince,
    count: items.length,
    disclaimer: DISCLAIMER,
    items,
  };
}

export function healthPayload(): HealthResponse {
  return {
    ok: true,
    as_of: new Date().toISOString(),
    items_cached: storeSize(),
    last_poll_ok: pollMeta.lastPollOk,
  };
}
