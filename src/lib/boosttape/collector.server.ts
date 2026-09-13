import {
  MAX_ORDER_CHECKS_PER_POLL,
  MIN_RETRY_MS,
  POLL_MS,
} from "./config";
import {
  fetchLatestBoosts,
  fetchLatestProfiles,
  fetchOrders,
  fetchPairsByTokens,
  fetchRecentProfileUpdates,
  fetchTopBoosts,
  isPaidOrder,
  num,
  pickBestPair,
  tokenPageUrl,
  type DsBoost,
  type DsPair,
  type DsProfile,
} from "./dexscreener.server";
import { allEvents, eventKey, getEvent, pollMeta, upsertEvent } from "./store.server";
import type { PromoEvent, StoredEvent } from "./types";

let inFlight: Promise<void> | null = null;
let intervalStarted = false;

function parseTime(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 1e12 ? value * 1000 : value;
  }
  if (typeof value === "string" && value.trim()) {
    const ms = Date.parse(value);
    return Number.isFinite(ms) ? ms : null;
  }
  return null;
}

function inheritFromSibling(chain: string, token: string): Partial<StoredEvent> {
  const prefix = `${chain.toLowerCase()}:${token.toLowerCase()}:`;
  let best: StoredEvent | undefined;
  for (const ev of allEvents()) {
    if (!ev.key.startsWith(prefix)) continue;
    if (!best || ev.lastEnrichedAt > best.lastEnrichedAt) best = ev;
  }
  if (!best || !best.symbol) return {};
  return {
    symbol: best.symbol,
    name: best.name,
    pair: best.pair,
    dexscreenerUrl: best.dexscreenerUrl,
    liquidityUsd: best.liquidityUsd,
    volume24hUsd: best.volume24hUsd,
    priceUsd: best.priceUsd,
    changeM5: best.changeM5,
    changeH1: best.changeH1,
    changeH6: best.changeH6,
    pairCreatedAt: best.pairCreatedAt,
    snapshotPriceUsd: best.snapshotPriceUsd,
    lastEnrichedAt: best.lastEnrichedAt,
  };
}

function seedEvent(input: {
  chain: string;
  token: string;
  event: PromoEvent;
  url?: string;
  eventAt: number;
  boostAmount?: number | null;
}): StoredEvent {
  const chain = input.chain.toLowerCase();
  const token = input.token;
  const key = eventKey(chain, token, input.event);
  const existing = getEvent(key);
  const inherited = existing ? {} : inheritFromSibling(chain, token);
  const now = Date.now();
  const eventAt = existing ? Math.min(existing.eventAt, input.eventAt) : input.eventAt;
  return upsertEvent({
    key,
    chain,
    token,
    event: input.event,
    eventAt,
    firstSeenAt: existing?.firstSeenAt ?? now,
    snapshotPriceUsd: existing?.snapshotPriceUsd ?? inherited.snapshotPriceUsd ?? null,
    symbol: existing?.symbol || inherited.symbol || "",
    name: existing?.name ?? inherited.name ?? null,
    pair: existing?.pair ?? inherited.pair ?? null,
    dexscreenerUrl:
      input.url || existing?.dexscreenerUrl || inherited.dexscreenerUrl || tokenPageUrl(chain, token),
    liquidityUsd: existing?.liquidityUsd ?? inherited.liquidityUsd ?? null,
    volume24hUsd: existing?.volume24hUsd ?? inherited.volume24hUsd ?? null,
    priceUsd: existing?.priceUsd ?? inherited.priceUsd ?? null,
    changeM5: existing?.changeM5 ?? inherited.changeM5 ?? null,
    changeH1: existing?.changeH1 ?? inherited.changeH1 ?? null,
    changeH6: existing?.changeH6 ?? inherited.changeH6 ?? null,
    pairCreatedAt: existing?.pairCreatedAt ?? inherited.pairCreatedAt ?? null,
    boostAmount: input.boostAmount ?? existing?.boostAmount ?? null,
    lastEnrichedAt: existing?.lastEnrichedAt ?? inherited.lastEnrichedAt ?? 0,
    ordersChecked: existing?.ordersChecked ?? false,
  });
}

function ingestBoosts(rows: DsBoost[], now: number) {
  for (const row of rows) {
    if (!row.chainId || !row.tokenAddress) continue;
    seedEvent({
      chain: row.chainId,
      token: row.tokenAddress,
      event: "boost",
      url: row.url,
      eventAt: now,
      boostAmount: num(row.amount) ?? num(row.totalAmount),
    });
  }
}

function ingestProfiles(rows: DsProfile[], now: number) {
  for (const row of rows) {
    if (!row.chainId || !row.tokenAddress) continue;
    seedEvent({
      chain: row.chainId,
      token: row.tokenAddress,
      event: "profile",
      url: row.url,
      eventAt: parseTime(row.updatedAt) ?? now,
    });
  }
}

function applyPair(row: StoredEvent, pair: DsPair): StoredEvent {
  const tokenLc = row.token.toLowerCase();
  const base = pair.baseToken;
  const quote = pair.quoteToken;
  const isBase = base?.address?.toLowerCase() === tokenLc;
  const meta = isBase ? base : quote?.address?.toLowerCase() === tokenLc ? quote : base;
  const priceUsd = num(pair.priceUsd);
  const snapshot = row.snapshotPriceUsd ?? priceUsd;
  return upsertEvent({
    ...row,
    symbol: meta?.symbol || row.symbol,
    name: meta?.name ?? row.name,
    pair: pair.pairAddress ?? row.pair,
    dexscreenerUrl: pair.url || row.dexscreenerUrl,
    liquidityUsd: num(pair.liquidity?.usd),
    volume24hUsd: num(pair.volume?.h24),
    priceUsd,
    changeM5: num(pair.priceChange?.m5),
    changeH1: num(pair.priceChange?.h1),
    changeH6: num(pair.priceChange?.h6),
    pairCreatedAt: parseTime(pair.pairCreatedAt) ?? row.pairCreatedAt,
    snapshotPriceUsd: snapshot,
    lastEnrichedAt: Date.now(),
  });
}

async function enrichPairs(rows: StoredEvent[]) {
  const byChain = new Map<string, StoredEvent[]>();
  for (const row of rows) {
    const list = byChain.get(row.chain) ?? [];
    list.push(row);
    byChain.set(row.chain, list);
  }
  await Promise.all(
    [...byChain.entries()].map(async ([chain, list]) => {
      try {
        const pairs = await fetchPairsByTokens(
          chain,
          list.map((r) => r.token),
        );
        const grouped = new Map<string, DsPair[]>();
        for (const pair of pairs) {
          for (const addr of [pair.baseToken?.address, pair.quoteToken?.address]) {
            if (!addr) continue;
            const k = addr.toLowerCase();
            const bucket = grouped.get(k) ?? [];
            bucket.push(pair);
            grouped.set(k, bucket);
          }
        }
        for (const row of list) {
          const candidates = grouped.get(row.token.toLowerCase()) ?? [];
          const best = pickBestPair(row.token, candidates);
          if (best) applyPair(row, best);
        }
      } catch (err) {
        console.warn("[boosttape] pair enrich failed", chain, err);
      }
    }),
  );
}

async function checkPaid() {
  const pending = allEvents()
    .filter((r) => !r.ordersChecked)
    .sort((a, b) => b.eventAt - a.eventAt)
    .slice(0, MAX_ORDER_CHECKS_PER_POLL);

  for (const row of pending) {
    try {
      const orders = await fetchOrders(row.chain, row.token);
      const current = getEvent(row.key) ?? row;
      upsertEvent({ ...current, ordersChecked: true });
      const paid = orders.filter(isPaidOrder);
      if (paid.length === 0) continue;
      const ts =
        paid
          .map((o) => parseTime(o.paymentTimestamp))
          .filter((n): n is number => n != null)
          .sort((a, b) => b - a)[0] ?? Date.now();
      seedEvent({
        chain: row.chain,
        token: row.token,
        event: "paid",
        url: current.dexscreenerUrl,
        eventAt: ts,
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      console.warn("[boosttape] orders failed", row.chain, row.token, message);
      if (message.includes(" 429 ")) break;
    }
  }
}

function backfillSparse() {
  for (const ev of allEvents()) {
    if (ev.symbol) continue;
    const inherited = inheritFromSibling(ev.chain, ev.token);
    if (!inherited.symbol) continue;
    upsertEvent({ ...ev, ...inherited });
  }
}

async function pollOnce() {
  try {
    await pollOnceUnsafe();
  } catch (err) {
    pollMeta.lastPollAt = Date.now();
    pollMeta.lastPollOk = false;
    pollMeta.lastError = err instanceof Error ? err.message : "poll failed";
    console.warn("[boosttape] poll failed", err);
  }
}

async function pollOnceUnsafe() {
  const now = Date.now();
  const results = await Promise.allSettled([
    fetchLatestBoosts(),
    fetchTopBoosts(),
    fetchLatestProfiles(),
    fetchRecentProfileUpdates(),
  ]);

  const [boosts, top, profiles, updates] = results;
  let ok = false;
  if (boosts.status === "fulfilled") {
    ingestBoosts(boosts.value, now);
    ok = true;
  }
  if (top.status === "fulfilled") {
    ingestBoosts(top.value, now);
    ok = true;
  }
  if (profiles.status === "fulfilled") {
    ingestProfiles(profiles.value, now);
    ok = true;
  }
  if (updates.status === "fulfilled") {
    ingestProfiles(updates.value, now);
    ok = true;
  }

  const recent = allEvents()
    .sort((a, b) => b.eventAt - a.eventAt)
    .slice(0, 120);
  await enrichPairs(recent);
  await checkPaid();
  backfillSparse();

  pollMeta.lastPollAt = Date.now();
  pollMeta.lastPollOk = ok;
  pollMeta.lastError = ok
    ? null
    : results
        .filter((r) => r.status === "rejected")
        .map((r) => (r as PromiseRejectedResult).reason?.message ?? "poll failed")
        .join("; ") || "poll failed";
}

export async function ensureFresh(): Promise<void> {
  const last = pollMeta.lastPollAt;
  const age = last == null ? Infinity : Date.now() - last;
  const retryFloor = pollMeta.lastPollOk ? POLL_MS : MIN_RETRY_MS;
  if (age < retryFloor && last != null) return;
  if (inFlight) return inFlight;
  inFlight = pollOnce().finally(() => {
    inFlight = null;
  });
  startBackgroundPoll();
  return inFlight;
}

function startBackgroundPoll() {
  if (intervalStarted) return;
  intervalStarted = true;
  const timer = setInterval(() => {
    void ensureFresh();
  }, POLL_MS);
  timer.unref?.();
}

export function collectorHealth() {
  return {
    lastPollOk: pollMeta.lastPollOk,
    lastPollAt: pollMeta.lastPollAt,
    items: allEvents().length,
  };
}
