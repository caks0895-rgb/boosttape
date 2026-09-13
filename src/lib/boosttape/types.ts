export const CHAINS = ["solana", "base", "robinhood", "all"] as const;
export const EVENT_TYPES = ["boost", "profile", "paid", "all"] as const;

export type ChainFilter = (typeof CHAINS)[number];
export type EventTypeFilter = (typeof EVENT_TYPES)[number];
export type PromoEvent = "boost" | "profile" | "paid";

export type FlagName =
  | "thin_lp"
  | "dumped_after_boost"
  | "pumped_then_flat"
  | "too_new"
  | "missing_price";

export type ChangeAfter = {
  m5: number | null;
  h1: number | null;
  h6: number | null;
};

export type EventItem = {
  symbol: string;
  name: string | null;
  chain: string;
  token: string;
  pair: string | null;
  dexscreener_url: string;
  event: PromoEvent;
  event_at: string | null;
  age_min: number | null;
  liquidity_usd: number | null;
  volume_24h_usd: number | null;
  price_usd: number | null;
  change_after: ChangeAfter;
  flags: FlagName[];
};

export type EventsResponse = {
  as_of: string;
  since: string | null;
  next_since: string;
  count: number;
  disclaimer: string;
  items: EventItem[];
};

export type HealthResponse = {
  ok: boolean;
  as_of: string;
  items_cached: number;
  last_poll_ok: boolean;
};

export type PaymentPublicStatus = {
  enabled: boolean;
  price: string;
  network: string;
  asset: string;
};

export type EventsQuery = {
  chain: ChainFilter;
  type: EventTypeFilter;
  limit: number;
  min_liq: number;
  sinceMs: number | null;
};

export const DISCLAIMER =
  "DexScreener boost/profile/paid are promotions, not safety verification.";

export type StoredEvent = {
  key: string;
  chain: string;
  token: string;
  event: PromoEvent;
  eventAt: number;
  firstSeenAt: number;
  snapshotPriceUsd: number | null;
  symbol: string;
  name: string | null;
  pair: string | null;
  dexscreenerUrl: string;
  liquidityUsd: number | null;
  volume24hUsd: number | null;
  priceUsd: number | null;
  changeM5: number | null;
  changeH1: number | null;
  changeH6: number | null;
  pairCreatedAt: number | null;
  boostAmount: number | null;
  lastEnrichedAt: number;
  ordersChecked: boolean;
};
