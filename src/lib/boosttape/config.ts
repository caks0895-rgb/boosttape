export const POLL_MS = 45_000;
export const MIN_RETRY_MS = 12_000;
export const FETCH_TIMEOUT_MS = 8_000;
export const MAX_STORE = 800;
export const MAX_ORDER_CHECKS_PER_POLL = 3;
export const TOKEN_BATCH = 30;
export const DEFAULT_LIMIT = 5;
export const MIN_LIMIT = 3;
export const MAX_LIMIT = 10;
export const DEFAULT_MIN_LIQ = 5_000;
export const THIN_LP_USD = 10_000;
export const TOO_NEW_MS = 6 * 60 * 60 * 1000;
export const DUMP_H1 = -20;
export const DUMP_M5 = -15;
export const PUMP_H1 = 25;
export const FLAT_M5 = 3;

export const DS = "https://api.dexscreener.com";

export const UA = "BoostTape/1.0 (agent promotion-event feed)";

/** Public x402 price. Not a secret. USDC on Base, 6 decimals → 5000 atomic units. */
export const X402_PRICE = "$0.005";

export const X402_NETWORK = "eip155:8453";
export const X402_NETWORK_NAME = "Base";
export const X402_ASSET = "USDC";
export const X402_ROUTE = "GET /v1/events";
