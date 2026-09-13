import { DS, FETCH_TIMEOUT_MS, TOKEN_BATCH, UA } from "./config";

export type DsBoost = {
  url?: string;
  chainId?: string;
  tokenAddress?: string;
  amount?: number;
  totalAmount?: number;
};

export type DsProfile = {
  url?: string;
  chainId?: string;
  tokenAddress?: string;
  updatedAt?: string;
};

export type DsOrder = {
  type?: string;
  status?: string;
  paymentTimestamp?: number;
  chainId?: string;
  tokenAddress?: string;
};

export type DsPair = {
  chainId?: string;
  dexId?: string;
  url?: string;
  pairAddress?: string;
  baseToken?: { address?: string; name?: string; symbol?: string };
  quoteToken?: { address?: string; name?: string; symbol?: string };
  priceUsd?: string | number;
  priceChange?: { m5?: number; h1?: number; h6?: number; h24?: number };
  liquidity?: { usd?: number };
  volume?: { h24?: number };
  pairCreatedAt?: number;
  boosts?: { active?: number };
};

const PAID_ORDER_TYPES = new Set([
  "tokenAd",
  "trendingBarAd",
  "communityTakeover",
]);

async function getJson(path: string): Promise<unknown> {
  const res = await fetch(`${DS}${path}`, {
    headers: { accept: "application/json", "user-agent": UA },
    signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
  });
  if (!res.ok) {
    throw new Error(`dexscreener ${res.status} ${path}`);
  }
  return res.json();
}

function asArray(data: unknown): unknown[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.data)) return rec.data;
    if (Array.isArray(rec.pairs)) return rec.pairs;
  }
  return [];
}

export async function fetchLatestBoosts(): Promise<DsBoost[]> {
  return asArray(await getJson("/token-boosts/latest/v1")) as DsBoost[];
}

export async function fetchTopBoosts(): Promise<DsBoost[]> {
  return asArray(await getJson("/token-boosts/top/v1")) as DsBoost[];
}

export async function fetchLatestProfiles(): Promise<DsProfile[]> {
  return asArray(await getJson("/token-profiles/latest/v1")) as DsProfile[];
}

export async function fetchRecentProfileUpdates(): Promise<DsProfile[]> {
  return asArray(await getJson("/token-profiles/recent-updates/v1")) as DsProfile[];
}

export async function fetchOrders(
  chainId: string,
  tokenAddress: string,
): Promise<DsOrder[]> {
  const data = await getJson(
    `/orders/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`,
  );
  if (Array.isArray(data)) return data as DsOrder[];
  if (data && typeof data === "object") {
    const rec = data as Record<string, unknown>;
    if (Array.isArray(rec.orders)) return rec.orders as DsOrder[];
  }
  return [];
}

export function isPaidOrder(order: DsOrder): boolean {
  if (!order.type || !PAID_ORDER_TYPES.has(order.type)) return false;
  const status = (order.status ?? "").toLowerCase();
  return status === "approved" || status === "processing";
}

export async function fetchPairsByTokens(
  chainId: string,
  tokenAddresses: string[],
): Promise<DsPair[]> {
  if (tokenAddresses.length === 0) return [];
  const unique = [...new Set(tokenAddresses)];
  const out: DsPair[] = [];
  for (let i = 0; i < unique.length; i += TOKEN_BATCH) {
    const chunk = unique.slice(i, i + TOKEN_BATCH);
    const path = `/tokens/v1/${encodeURIComponent(chainId)}/${chunk.join(",")}`;
    const data = await getJson(path);
    out.push(...(asArray(data) as DsPair[]));
  }
  return out;
}

export function pickBestPair(token: string, pairs: DsPair[]): DsPair | null {
  const want = token.toLowerCase();
  const matching = pairs.filter((p) => {
    const base = p.baseToken?.address?.toLowerCase();
    const quote = p.quoteToken?.address?.toLowerCase();
    return base === want || quote === want;
  });
  const pool = matching.length > 0 ? matching : pairs;
  if (pool.length === 0) return null;
  return pool.reduce((best, cur) => {
    const a = best.liquidity?.usd ?? 0;
    const b = cur.liquidity?.usd ?? 0;
    return b > a ? cur : best;
  });
}

export function num(v: unknown): number | null {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim()) {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

export function tokenPageUrl(chain: string, token: string): string {
  return `https://dexscreener.com/${chain}/${token}`;
}
