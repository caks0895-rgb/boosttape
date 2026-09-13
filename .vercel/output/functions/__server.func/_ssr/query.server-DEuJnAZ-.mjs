//#region node_modules/.nitro/vite/services/ssr/assets/query.server-DEuJnAZ-.js
var POLL_MS = 45e3;
var FETCH_TIMEOUT_MS = 8e3;
var DEFAULT_MIN_LIQ = 5e3;
var DS = "https://api.dexscreener.com";
var UA = "BoostTape/1.0 (agent promotion-event feed)";
/** Public x402 price. Not a secret. USDC on Base, 6 decimals → 1000 atomic units. */
var X402_PRICE = "$0.001";
var X402_NETWORK = "eip155:8453";
var X402_ASSET = "USDC";
var PAID_ORDER_TYPES = /* @__PURE__ */ new Set([
	"tokenAd",
	"trendingBarAd",
	"communityTakeover"
]);
async function getJson(path) {
	const res = await fetch(`${DS}${path}`, {
		headers: {
			accept: "application/json",
			"user-agent": UA
		},
		signal: AbortSignal.timeout(FETCH_TIMEOUT_MS)
	});
	if (!res.ok) throw new Error(`dexscreener ${res.status} ${path}`);
	return res.json();
}
function asArray(data) {
	if (Array.isArray(data)) return data;
	if (data && typeof data === "object") {
		const rec = data;
		if (Array.isArray(rec.data)) return rec.data;
		if (Array.isArray(rec.pairs)) return rec.pairs;
	}
	return [];
}
async function fetchLatestBoosts() {
	return asArray(await getJson("/token-boosts/latest/v1"));
}
async function fetchTopBoosts() {
	return asArray(await getJson("/token-boosts/top/v1"));
}
async function fetchLatestProfiles() {
	return asArray(await getJson("/token-profiles/latest/v1"));
}
async function fetchRecentProfileUpdates() {
	return asArray(await getJson("/token-profiles/recent-updates/v1"));
}
async function fetchOrders(chainId, tokenAddress) {
	const data = await getJson(`/orders/v1/${encodeURIComponent(chainId)}/${encodeURIComponent(tokenAddress)}`);
	if (Array.isArray(data)) return data;
	if (data && typeof data === "object") {
		const rec = data;
		if (Array.isArray(rec.orders)) return rec.orders;
	}
	return [];
}
function isPaidOrder(order) {
	if (!order.type || !PAID_ORDER_TYPES.has(order.type)) return false;
	const status = (order.status ?? "").toLowerCase();
	return status === "approved" || status === "processing";
}
async function fetchPairsByTokens(chainId, tokenAddresses) {
	if (tokenAddresses.length === 0) return [];
	const unique = [...new Set(tokenAddresses)];
	const out = [];
	for (let i = 0; i < unique.length; i += 30) {
		const chunk = unique.slice(i, i + 30);
		const data = await getJson(`/tokens/v1/${encodeURIComponent(chainId)}/${chunk.join(",")}`);
		out.push(...asArray(data));
	}
	return out;
}
function pickBestPair(token, pairs) {
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
		return (cur.liquidity?.usd ?? 0) > a ? cur : best;
	});
}
function num(v) {
	if (typeof v === "number" && Number.isFinite(v)) return v;
	if (typeof v === "string" && v.trim()) {
		const n = Number(v);
		return Number.isFinite(n) ? n : null;
	}
	return null;
}
function tokenPageUrl(chain, token) {
	return `https://dexscreener.com/${chain}/${token}`;
}
var events = /* @__PURE__ */ new Map();
var pollMeta = {
	lastPollAt: null,
	lastPollOk: false,
	lastError: null,
	startedAt: Date.now()
};
function eventKey(chain, token, event) {
	return `${chain.toLowerCase()}:${token.toLowerCase()}:${event}`;
}
function upsertEvent(next) {
	const prev = events.get(next.key);
	if (!prev) {
		events.set(next.key, next);
		evictIfNeeded();
		return next;
	}
	const merged = {
		...prev,
		...next,
		eventAt: Math.min(prev.eventAt, next.eventAt),
		firstSeenAt: Math.min(prev.firstSeenAt, next.firstSeenAt),
		snapshotPriceUsd: prev.snapshotPriceUsd ?? next.snapshotPriceUsd,
		ordersChecked: prev.ordersChecked || next.ordersChecked
	};
	events.set(next.key, merged);
	return merged;
}
function getEvent(key) {
	return events.get(key);
}
function allEvents() {
	return [...events.values()];
}
function storeSize() {
	return events.size;
}
function evictIfNeeded() {
	if (events.size <= 800) return;
	const ranked = [...events.values()].sort((a, b) => a.eventAt - b.eventAt);
	const drop = events.size - 800;
	for (let i = 0; i < drop; i++) {
		const item = ranked[i];
		if (item) events.delete(item.key);
	}
}
var inFlight = null;
var intervalStarted = false;
function parseTime(value) {
	if (typeof value === "number" && Number.isFinite(value)) return value < 0xe8d4a51000 ? value * 1e3 : value;
	if (typeof value === "string" && value.trim()) {
		const ms = Date.parse(value);
		return Number.isFinite(ms) ? ms : null;
	}
	return null;
}
function inheritFromSibling(chain, token) {
	const prefix = `${chain.toLowerCase()}:${token.toLowerCase()}:`;
	let best;
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
		lastEnrichedAt: best.lastEnrichedAt
	};
}
function seedEvent(input) {
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
		dexscreenerUrl: input.url || existing?.dexscreenerUrl || inherited.dexscreenerUrl || tokenPageUrl(chain, token),
		liquidityUsd: existing?.liquidityUsd ?? inherited.liquidityUsd ?? null,
		volume24hUsd: existing?.volume24hUsd ?? inherited.volume24hUsd ?? null,
		priceUsd: existing?.priceUsd ?? inherited.priceUsd ?? null,
		changeM5: existing?.changeM5 ?? inherited.changeM5 ?? null,
		changeH1: existing?.changeH1 ?? inherited.changeH1 ?? null,
		changeH6: existing?.changeH6 ?? inherited.changeH6 ?? null,
		pairCreatedAt: existing?.pairCreatedAt ?? inherited.pairCreatedAt ?? null,
		boostAmount: input.boostAmount ?? existing?.boostAmount ?? null,
		lastEnrichedAt: existing?.lastEnrichedAt ?? inherited.lastEnrichedAt ?? 0,
		ordersChecked: existing?.ordersChecked ?? false
	});
}
function ingestBoosts(rows, now) {
	for (const row of rows) {
		if (!row.chainId || !row.tokenAddress) continue;
		seedEvent({
			chain: row.chainId,
			token: row.tokenAddress,
			event: "boost",
			url: row.url,
			eventAt: now,
			boostAmount: num(row.amount) ?? num(row.totalAmount)
		});
	}
}
function ingestProfiles(rows, now) {
	for (const row of rows) {
		if (!row.chainId || !row.tokenAddress) continue;
		seedEvent({
			chain: row.chainId,
			token: row.tokenAddress,
			event: "profile",
			url: row.url,
			eventAt: parseTime(row.updatedAt) ?? now
		});
	}
}
function applyPair(row, pair) {
	const tokenLc = row.token.toLowerCase();
	const base = pair.baseToken;
	const quote = pair.quoteToken;
	const meta = base?.address?.toLowerCase() === tokenLc ? base : quote?.address?.toLowerCase() === tokenLc ? quote : base;
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
		lastEnrichedAt: Date.now()
	});
}
async function enrichPairs(rows) {
	const byChain = /* @__PURE__ */ new Map();
	for (const row of rows) {
		const list = byChain.get(row.chain) ?? [];
		list.push(row);
		byChain.set(row.chain, list);
	}
	await Promise.all([...byChain.entries()].map(async ([chain, list]) => {
		try {
			const pairs = await fetchPairsByTokens(chain, list.map((r) => r.token));
			const grouped = /* @__PURE__ */ new Map();
			for (const pair of pairs) for (const addr of [pair.baseToken?.address, pair.quoteToken?.address]) {
				if (!addr) continue;
				const k = addr.toLowerCase();
				const bucket = grouped.get(k) ?? [];
				bucket.push(pair);
				grouped.set(k, bucket);
			}
			for (const row of list) {
				const candidates = grouped.get(row.token.toLowerCase()) ?? [];
				const best = pickBestPair(row.token, candidates);
				if (best) applyPair(row, best);
			}
		} catch (err) {
			console.warn("[boosttape] pair enrich failed", chain, err);
		}
	}));
}
async function checkPaid() {
	const pending = allEvents().filter((r) => !r.ordersChecked).sort((a, b) => b.eventAt - a.eventAt).slice(0, 3);
	for (const row of pending) try {
		const orders = await fetchOrders(row.chain, row.token);
		const current = getEvent(row.key) ?? row;
		upsertEvent({
			...current,
			ordersChecked: true
		});
		const paid = orders.filter(isPaidOrder);
		if (paid.length === 0) continue;
		const ts = paid.map((o) => parseTime(o.paymentTimestamp)).filter((n) => n != null).sort((a, b) => b - a)[0] ?? Date.now();
		seedEvent({
			chain: row.chain,
			token: row.token,
			event: "paid",
			url: current.dexscreenerUrl,
			eventAt: ts
		});
	} catch (err) {
		const message = err instanceof Error ? err.message : String(err);
		console.warn("[boosttape] orders failed", row.chain, row.token, message);
		if (message.includes(" 429 ")) break;
	}
}
function backfillSparse() {
	for (const ev of allEvents()) {
		if (ev.symbol) continue;
		const inherited = inheritFromSibling(ev.chain, ev.token);
		if (!inherited.symbol) continue;
		upsertEvent({
			...ev,
			...inherited
		});
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
		fetchRecentProfileUpdates()
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
	await enrichPairs(allEvents().sort((a, b) => b.eventAt - a.eventAt).slice(0, 120));
	await checkPaid();
	backfillSparse();
	pollMeta.lastPollAt = Date.now();
	pollMeta.lastPollOk = ok;
	pollMeta.lastError = ok ? null : results.filter((r) => r.status === "rejected").map((r) => r.reason?.message ?? "poll failed").join("; ") || "poll failed";
}
async function ensureFresh() {
	const last = pollMeta.lastPollAt;
	if ((last == null ? Infinity : Date.now() - last) < (pollMeta.lastPollOk ? 45e3 : 12e3) && last != null) return;
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
	setInterval(() => {
		ensureFresh();
	}, POLL_MS).unref?.();
}
function env(key) {
	return process.env[key]?.trim() || void 0;
}
var PAY_TO_RE = /^0x[a-fA-F0-9]{40}$/;
/**
* Reads payment env. Values never leave this server module.
* Armed only when all three are present and payTo is a valid EVM address.
* Partial/invalid config is misconfigured (fail-closed on the paid route).
*/
function readPaymentConfig() {
	const apiKeyId = env("CDP_API_KEY_ID");
	const apiKeySecret = env("CDP_API_KEY_SECRET");
	const payTo = env("X402_PAY_TO");
	if ([
		apiKeyId,
		apiKeySecret,
		payTo
	].filter(Boolean).length === 0) return { kind: "off" };
	if (!apiKeyId || !apiKeySecret || !payTo || !PAY_TO_RE.test(payTo)) return { kind: "misconfigured" };
	return {
		kind: "ready",
		apiKeyId,
		apiKeySecret,
		payTo
	};
}
/** Public flags only. Never includes keys, payTo, or secret names' values. */
function paymentPublicStatus() {
	return {
		enabled: readPaymentConfig().kind === "ready",
		price: X402_PRICE,
		network: X402_NETWORK,
		asset: X402_ASSET
	};
}
function computeFlags(input) {
	const flags = [];
	if (input.liquidityUsd != null && input.liquidityUsd < 1e4) flags.push("thin_lp");
	if (input.event === "boost" && (input.changeH1 != null && input.changeH1 <= -20 || input.changeM5 != null && input.changeM5 <= -15)) flags.push("dumped_after_boost");
	if (input.changeH1 != null && input.changeH1 >= 25 && input.changeM5 != null && Math.abs(input.changeM5) <= 3) flags.push("pumped_then_flat");
	if (input.pairCreatedAt != null && input.now - input.pairCreatedAt < 216e5) flags.push("too_new");
	if (input.priceUsd == null) flags.push("missing_price");
	return flags;
}
/**
* ISO-8601 (must start YYYY-MM-DD), unix seconds, or unix milliseconds.
* Values below 1e12 are treated as seconds.
*/
function parseSinceMs(raw) {
	const t = raw.trim();
	if (!t) return null;
	if (/^\d+(\.\d+)?$/.test(t)) {
		const n = Number(t);
		if (!Number.isFinite(n) || n < 0) return null;
		return n < 0xe8d4a51000 ? Math.round(n * 1e3) : Math.round(n);
	}
	if (!/^\d{4}-\d{2}-\d{2}/.test(t)) return null;
	const ms = Date.parse(t);
	return Number.isFinite(ms) ? ms : null;
}
var CHAINS = [
	"solana",
	"base",
	"robinhood",
	"all"
];
var EVENT_TYPES = [
	"boost",
	"profile",
	"paid",
	"all"
];
var DISCLAIMER = "DexScreener boost/profile/paid are promotions, not safety verification.";
var EVENT_PRI = {
	boost: 0,
	paid: 1,
	profile: 2
};
function parseEventsQuery(url) {
	const chainRaw = (url.searchParams.get("chain") ?? "all").toLowerCase();
	const typeRaw = (url.searchParams.get("type") ?? "all").toLowerCase();
	const limitRaw = url.searchParams.get("limit");
	const minLiqRaw = url.searchParams.get("min_liq");
	const sinceRaw = url.searchParams.get("since") ?? url.searchParams.get("since_timestamp") ?? url.searchParams.get("cursor");
	if (!CHAINS.includes(chainRaw)) return {
		ok: false,
		error: `chain must be one of ${CHAINS.join(", ")}`
	};
	if (!EVENT_TYPES.includes(typeRaw)) return {
		ok: false,
		error: `type must be one of ${EVENT_TYPES.join(", ")}`
	};
	let limit = 5;
	if (limitRaw != null && limitRaw !== "") {
		const n = Number(limitRaw);
		if (!Number.isInteger(n) || n < 3 || n > 10) return {
			ok: false,
			error: `limit must be an integer 3..10`
		};
		limit = n;
	}
	let min_liq = DEFAULT_MIN_LIQ;
	if (minLiqRaw != null && minLiqRaw !== "") {
		const n = Number(minLiqRaw);
		if (!Number.isFinite(n) || n < 0) return {
			ok: false,
			error: "min_liq must be a number >= 0"
		};
		min_liq = n;
	}
	let sinceMs = null;
	if (sinceRaw != null && sinceRaw !== "") {
		const parsed = parseSinceMs(sinceRaw);
		if (parsed == null) return {
			ok: false,
			error: "since must be ISO-8601 or unix seconds/ms"
		};
		sinceMs = parsed;
	}
	return {
		ok: true,
		query: {
			chain: chainRaw,
			type: typeRaw,
			limit,
			min_liq,
			sinceMs
		}
	};
}
function toItem(row, now) {
	const ageMin = Number.isFinite(row.eventAt) ? Math.max(0, Math.round((now - row.eventAt) / 6e4)) : null;
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
			h6: row.changeH6
		},
		flags: computeFlags({
			event: row.event,
			liquidityUsd: row.liquidityUsd,
			priceUsd: row.priceUsd,
			changeM5: row.changeM5,
			changeH1: row.changeH1,
			pairCreatedAt: row.pairCreatedAt,
			now
		})
	};
}
function shortToken(token) {
	if (token.length <= 10) return token;
	return `${token.slice(0, 4)}…${token.slice(-4)}`;
}
function queryEvents(q) {
	const now = Date.now();
	let rows = allEvents();
	if (q.chain !== "all") rows = rows.filter((r) => r.chain === q.chain);
	if (q.type !== "all") rows = rows.filter((r) => r.event === q.type);
	rows = rows.filter((r) => r.liquidityUsd == null || r.liquidityUsd >= q.min_liq);
	let picked;
	if (q.sinceMs == null) {
		rows.sort((a, b) => b.eventAt - a.eventAt || EVENT_PRI[a.event] - EVENT_PRI[b.event]);
		const seen = /* @__PURE__ */ new Set();
		picked = [];
		for (const row of rows) {
			const tokenKey = `${row.chain}:${row.token.toLowerCase()}`;
			if (seen.has(tokenKey)) continue;
			seen.add(tokenKey);
			picked.push(row);
			if (picked.length >= q.limit) break;
		}
	} else {
		rows = rows.filter((r) => Number.isFinite(r.eventAt) && r.eventAt > q.sinceMs);
		rows.sort((a, b) => a.eventAt - b.eventAt || EVENT_PRI[a.event] - EVENT_PRI[b.event] || a.key.localeCompare(b.key));
		picked = rows.slice(0, q.limit);
	}
	const items = picked.map((r) => toItem(r, now));
	const asOf = new Date(now).toISOString();
	const sinceIso = q.sinceMs == null ? null : new Date(q.sinceMs).toISOString();
	let nextSince = asOf;
	if (q.sinceMs != null) {
		const last = picked[picked.length - 1];
		nextSince = last ? new Date(last.eventAt).toISOString() : sinceIso;
	}
	return {
		as_of: asOf,
		since: sinceIso,
		next_since: nextSince,
		count: items.length,
		disclaimer: DISCLAIMER,
		items
	};
}
function healthPayload() {
	return {
		ok: true,
		as_of: (/* @__PURE__ */ new Date()).toISOString(),
		items_cached: storeSize(),
		last_poll_ok: pollMeta.lastPollOk
	};
}
//#endregion
export { X402_NETWORK as a, healthPayload as c, queryEvents as d, readPaymentConfig as f, X402_ASSET as i, parseEventsQuery as l, DISCLAIMER as n, X402_PRICE as o, EVENT_TYPES as r, ensureFresh as s, CHAINS as t, paymentPublicStatus as u };
