import { o as __toESM } from "../_runtime.mjs";
import { R as require_react, _ as useRouter, f as createRouter, g as createRootRoute, h as createFileRoute, l as Scripts, m as lazyRouteComponent, p as Outlet, u as HeadContent, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "./ssr.mjs";
import { a as X402_NETWORK, c as healthPayload, d as queryEvents, f as readPaymentConfig, i as X402_ASSET, l as parseEventsQuery, n as DISCLAIMER, o as X402_PRICE, s as ensureFresh } from "./query.server-DEuJnAZ-.mjs";
import { t as TriangleAlert } from "../_libs/lucide-react.mjs";
import { a as union, i as string, n as number, r as object, t as literal } from "../_libs/zod.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/router-DBQ0KJNw.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
var FALLBACK_MESSAGE = "An unexpected error occurred. Try reloading the page.";
function errorMessage(error) {
	if (error instanceof Error && error.message) return error.message;
	if (typeof error === "string" && error) return error;
	return FALLBACK_MESSAGE;
}
function AppErrorComponent({ error }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "flex min-h-screen flex-col items-center justify-center gap-3 px-6 text-center bg-zinc-50 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-50",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "text-red-500",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(TriangleAlert, {
					className: "size-10",
					strokeWidth: 2
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
				className: "text-lg font-semibold",
				children: "Something went wrong"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "max-w-md text-sm break-words text-zinc-500 dark:text-zinc-400",
				children: errorMessage(error)
			})
		]
	});
}
/**
* App-wide client provider mounted once near the root (in `src/routes/__root.tsx`):
*
*   <AuthProvider><Outlet /></AuthProvider>
*
* Better Auth's React client (`@/lib/auth/client`) needs NO context provider —
* its `useSession()` works standalone — so this is a passthrough today. It's
* kept as the single, stable mount point for any future client-side providers
* (e.g. a toast or theme provider) without churning the root shell.
*/
function AuthProvider({ children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(import_jsx_runtime.Fragment, { children });
}
var CONNECTOR_TOKEN_READY_EVENT = "grok:connector-token-ready";
function isGrokEmbedderOrigin(origin) {
	try {
		const url = new URL(origin);
		if (url.protocol !== "https:" && url.protocol !== "http:") return false;
		const host = url.hostname.toLowerCase();
		if (host === "grok.com" || host.endsWith(".grok.com")) return true;
		if (host === "localhost" || host === "127.0.0.1" || host === "[::1]") return true;
		return false;
	} catch {
		return false;
	}
}
function isSandboxPreviewGuestHost(hostname) {
	const host = hostname.toLowerCase();
	return host === "grok-sandbox.com" || host.endsWith(".grok-sandbox.com");
}
function isRemintPreviewPair(guestHost, parentHost) {
	const guest = guestHost.toLowerCase();
	const parent = parentHost.toLowerCase();
	const i = guest.indexOf(".preview.");
	if (i <= 0) return false;
	const label = guest.slice(0, i);
	const rest = guest.slice(i + 9);
	if (label.includes(".") || !rest.includes(".")) return false;
	return parent === rest || parent === `grok.${rest}`;
}
function resolveParentEmbedderOrigin(parentIsSelf, referrer, ancestorOrigin, guestHostname = "") {
	if (parentIsSelf) return null;
	for (const candidate of [referrer, ancestorOrigin ?? ""].filter(Boolean)) try {
		const url = new URL(candidate.includes("://") ? candidate : `https://${candidate}`);
		if (url.protocol !== "https:" && url.protocol !== "http:") continue;
		if (isGrokEmbedderOrigin(url.origin)) return url.origin;
		if (isSandboxPreviewGuestHost(guestHostname) || isRemintPreviewPair(guestHostname, url.hostname)) return url.origin;
	} catch {}
	return null;
}
/**
* Guest side of the grok-web ↔ sandbox preview postMessage bridge.
*
* Activates only when this page is framed by an allowlisted Grok embedder.
* Top-level runs (download/export, local `npm run dev`, deployed sites) noop.
*/
var PREVIEW_BRIDGE_CHANNEL = "grok-preview-bridge";
var EnvelopeSchema = object({
	channel: literal(PREVIEW_BRIDGE_CHANNEL),
	version: number().int().positive(),
	type: string().min(1)
});
var HelloSchema = EnvelopeSchema.extend({ type: literal("hello") });
var NavigateSchema = EnvelopeSchema.extend({
	type: literal("navigate"),
	path: string().min(1)
});
var HistorySchema = EnvelopeSchema.extend({
	type: literal("history"),
	delta: union([literal(-1), literal(1)])
});
var ConnectorTokenReadySchema = EnvelopeSchema.extend({ type: literal("connector-token-ready") });
function isSafeBridgePath(path) {
	if (!path.startsWith("/") || path.startsWith("//") || path.includes("\\")) return false;
	try {
		return new URL(path, "https://preview.invalid").origin === "https://preview.invalid";
	} catch {
		return false;
	}
}
/**
* Origin of the Grok embedder framing this page, or null when the page runs
* top-level (download/export, local `npm run dev`, deployed sites) or under a
* non-Grok parent. Client-only; null during SSR.
*/
function resolveCurrentEmbedderOrigin() {
	if (typeof window === "undefined") return null;
	const ancestorOrigin = typeof location.ancestorOrigins !== "undefined" && location.ancestorOrigins.length > 0 ? location.ancestorOrigins[0] : null;
	return resolveParentEmbedderOrigin(window.parent === window, document.referrer, ancestorOrigin, window.location.hostname);
}
/**
* Install host↔guest messaging. Returns a dispose function.
* Noops (returns a no-op dispose) when not embedded under a Grok parent.
*/
function installPreviewHostBridge(options = {}) {
	const parentOrigin = resolveCurrentEmbedderOrigin();
	if (parentOrigin === null) return () => {};
	const ROOT_STATE_KEY = "__grokPreviewBridgeRoot";
	const originalPushState = window.history.pushState.bind(window.history);
	const originalReplaceState = window.history.replaceState.bind(window.history);
	const isAtHistoryRoot = () => {
		const state = window.history.state;
		return Boolean(state && typeof state === "object" && state[ROOT_STATE_KEY] === true);
	};
	try {
		const current = window.history.state;
		if (!(current !== null && typeof current === "object" && Object.prototype.hasOwnProperty.call(current, ROOT_STATE_KEY))) {
			const isRoot = window.history.length <= 1;
			originalReplaceState(current && typeof current === "object" ? {
				...current,
				[ROOT_STATE_KEY]: isRoot
			} : { [ROOT_STATE_KEY]: isRoot }, "", window.location.href);
		}
	} catch {}
	const post = (message) => {
		window.parent.postMessage(message, parentOrigin);
	};
	const reportLocation = () => {
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "location",
			path: window.location.pathname || "/",
			search: window.location.search,
			hash: window.location.hash
		});
	};
	const reportRoutes = () => {
		const paths = options.getRoutePaths?.() ?? [];
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "routes",
			paths
		});
	};
	const defaultNavigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		try {
			const url = new URL(path, window.location.origin);
			if (url.origin !== window.location.origin) return;
			const next = `${url.pathname}${url.search}${url.hash}`;
			window.history.pushState(window.history.state, "", next);
			window.dispatchEvent(new PopStateEvent("popstate", { state: window.history.state }));
		} catch {}
	};
	const navigate = (path) => {
		if (!isSafeBridgePath(path)) return;
		if (options.navigate) {
			options.navigate(path);
			return;
		}
		defaultNavigate(path);
	};
	const announce = () => {
		reportLocation();
		reportRoutes();
		post({
			channel: PREVIEW_BRIDGE_CHANNEL,
			version: 1,
			type: "ready"
		});
	};
	const onHello = (data) => {
		if (!HelloSchema.safeParse(data).success) return;
		announce();
	};
	const onNavigate = (data) => {
		const parsed = NavigateSchema.safeParse(data);
		if (!parsed.success) return;
		navigate(parsed.data.path);
		queueMicrotask(reportLocation);
	};
	const onHistory = (data) => {
		const parsed = HistorySchema.safeParse(data);
		if (!parsed.success) return;
		if (parsed.data.delta === -1 && isAtHistoryRoot()) return;
		window.history.go(parsed.data.delta);
	};
	const onConnectorTokenReady = (data) => {
		if (!ConnectorTokenReadySchema.safeParse(data).success) return;
		window.dispatchEvent(new Event(CONNECTOR_TOKEN_READY_EVENT));
	};
	const hostMessageHandlers = /* @__PURE__ */ new Map([
		["hello", onHello],
		["navigate", onNavigate],
		["history", onHistory],
		["connector-token-ready", onConnectorTokenReady]
	]);
	const onMessage = (event) => {
		if (event.source !== window.parent) return;
		if (event.origin !== parentOrigin) return;
		const envelope = EnvelopeSchema.safeParse(event.data);
		if (!envelope.success || envelope.data.version !== 1) return;
		hostMessageHandlers.get(envelope.data.type)?.(event.data);
	};
	const onPopState = () => {
		reportLocation();
	};
	const onHashChange = () => {
		reportLocation();
	};
	window.history.pushState = (data, unused, url) => {
		const next = data && typeof data === "object" ? {
			...data,
			[ROOT_STATE_KEY]: false
		} : data;
		originalPushState(next, unused, url);
		reportLocation();
	};
	window.history.replaceState = (data, unused, url) => {
		const next = isAtHistoryRoot() ? {
			...data && typeof data === "object" ? data : {},
			[ROOT_STATE_KEY]: true
		} : data;
		originalReplaceState(next, unused, url);
		reportLocation();
	};
	window.addEventListener("message", onMessage);
	window.addEventListener("popstate", onPopState);
	window.addEventListener("hashchange", onHashChange);
	announce();
	return () => {
		window.removeEventListener("message", onMessage);
		window.removeEventListener("popstate", onPopState);
		window.removeEventListener("hashchange", onHashChange);
		window.history.pushState = originalPushState;
		window.history.replaceState = originalReplaceState;
	};
}
/** Collect static path patterns from a TanStack route tree (best-effort). */
function collectRoutePathsFromTree(routeTree) {
	const paths = /* @__PURE__ */ new Set();
	const walk = (node) => {
		if (!node || typeof node !== "object") return;
		const record = node;
		const full = typeof record.fullPath === "string" ? record.fullPath : typeof record.path === "string" ? record.path : null;
		if (full !== null && full !== "") paths.add(full.startsWith("/") ? full : `/${full}`);
		else if (full === "") paths.add("/");
		const children = record.children;
		if (Array.isArray(children)) for (const child of children) walk(child);
		else if (children && typeof children === "object") for (const child of Object.values(children)) walk(child);
	};
	walk(routeTree);
	return [...paths];
}
/**
* Mount once in `__root.tsx` so the Grok preview chrome can drive navigation
* (and later receive registered routes). Noops when the app is not embedded.
*/
function PreviewHostBridge() {
	const router = useRouter();
	(0, import_react.useEffect)(() => {
		return installPreviewHostBridge({
			navigate: (path) => {
				router.history.push(path);
			},
			getRoutePaths: () => collectRoutePathsFromTree(router.routeTree)
		});
	}, [router]);
	return null;
}
var styles_default = "/assets/styles-cRORFV3b.css";
var APP_NAME = "BoostTape";
var APP_DESC = "DexScreener promotion events for AI agents — boost, profile, and paid, with price reaction after the event.";
var Route$3 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: APP_NAME },
			{
				name: "description",
				content: APP_DESC
			},
			{
				name: "theme-color",
				content: "#0c0d0b"
			}
		],
		links: [
			{
				rel: "icon",
				type: "image/svg+xml",
				href: "/favicon.svg"
			},
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:ital,wght@0,400;0,500;0,600;1,400&family=Instrument+Serif:ital@0;1&display=swap"
			},
			{
				rel: "stylesheet",
				href: styles_default
			},
			{
				rel: "manifest",
				href: "/__grok/manifest.webmanifest"
			},
			{
				rel: "apple-touch-icon",
				href: "/__grok/icon-180.png"
			}
		]
	}),
	component: () => /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("html", {
		lang: "en",
		className: "antialiased",
		suppressHydrationWarning: true,
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("head", { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(HeadContent, {}) }), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("body", {
			className: "bg-bg text-fg font-sans",
			children: [
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(PreviewHostBridge, {}),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(AuthProvider, { children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Outlet, {}) }),
				/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Scripts, {})
			]
		})]
	})
});
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
var getLandingData = createServerFn({ method: "GET" }).handler(createSsrRpc("2feaec2eed45c2aecd2f03b1d83c78806d0219c8931dbbeba7fad8b3a45c7185"));
var $$splitComponentImporter = () => import("./routes-CIajaf1k.mjs");
var Route$2 = createFileRoute("/")({
	loader: () => getLandingData(),
	staleTime: 3e4,
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
var CORS_HEADERS = {
	"access-control-allow-origin": "*",
	"access-control-allow-methods": "GET, OPTIONS",
	"access-control-allow-headers": "Content-Type, Accept, PAYMENT-SIGNATURE, PAYMENT-REQUIRED",
	"access-control-expose-headers": "PAYMENT-RESPONSE, PAYMENT-REQUIRED"
};
function jsonResponse(body, init) {
	return Response.json(body, {
		status: init?.status ?? 200,
		headers: {
			...CORS_HEADERS,
			"cache-control": init?.cache ?? "public, max-age=15",
			...init?.headers
		}
	});
}
function corsPreflight() {
	return new Response(null, {
		status: 204,
		headers: {
			...CORS_HEADERS,
			"access-control-max-age": "86400"
		}
	});
}
var Route$1 = createFileRoute("/health")({ server: { handlers: {
	OPTIONS: () => corsPreflight(),
	GET: async () => {
		try {
			await ensureFresh();
		} catch (err) {
			console.warn("[boosttape] health refresh failed", err);
		}
		return jsonResponse(healthPayload(), { cache: "no-store" });
	}
} } });
var boot = null;
function adapterFromRequest(request) {
	const url = new URL(request.url);
	return {
		getHeader: (name) => request.headers.get(name) ?? void 0,
		getMethod: () => request.method,
		getPath: () => url.pathname,
		getUrl: () => request.url,
		getAcceptHeader: () => request.headers.get("accept") ?? "",
		getUserAgent: () => request.headers.get("user-agent") ?? "",
		getQueryParams: () => {
			const out = {};
			url.searchParams.forEach((v, k) => {
				out[k] = v;
			});
			return out;
		},
		getQueryParam: (name) => url.searchParams.get(name) ?? void 0
	};
}
function responseFromInstructions(instr) {
	const headers = new Headers(CORS_HEADERS);
	for (const [key, value] of Object.entries(instr.headers ?? {})) headers.set(key, value);
	if (!headers.has("cache-control")) headers.set("cache-control", "no-store");
	if (instr.isHtml) {
		if (!headers.has("content-type")) headers.set("content-type", "text/html; charset=utf-8");
		const html = typeof instr.body === "string" ? instr.body : "";
		return new Response(html, {
			status: instr.status,
			headers
		});
	}
	if (!headers.has("content-type")) headers.set("content-type", "application/json; charset=utf-8");
	const payload = instr.body === void 0 ? {} : instr.body;
	const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
	return new Response(serialized, {
		status: instr.status,
		headers
	});
}
function paymentUnavailable() {
	return jsonResponse({
		error: "payment_unavailable",
		message: "Payment rail is not ready. GET /health stays free."
	}, {
		status: 503,
		cache: "no-store"
	});
}
function bazaarExample() {
	return {
		as_of: "2026-09-13T00:00:00.000Z",
		since: null,
		next_since: "2026-09-13T00:00:00.000Z",
		count: 1,
		disclaimer: DISCLAIMER,
		items: [{
			symbol: "BLUXEL",
			name: "Bluxel",
			chain: "solana",
			token: "E4LtkkDAv5fPL7N4zLZMnFgfwu6WjVRGKnjTbHVTpump",
			pair: "EML4Rfp59DACH61Wv94jE27kTbrchSCDZA9HnkmP84vg",
			dexscreener_url: "https://dexscreener.com/solana/eml4rfp59dach61wv94je27ktbrchscdza9hnkmp84vg",
			event: "boost",
			event_at: "2026-09-13T00:00:00.000Z",
			age_min: 12,
			liquidity_usd: 8591.69,
			volume_24h_usd: 508.97,
			price_usd: 8296e-9,
			change_after: {
				m5: 24.05,
				h1: 24.05,
				h6: 24.05
			},
			flags: ["thin_lp"]
		}]
	};
}
async function bootServer() {
	const cfg = readPaymentConfig();
	if (cfg.kind === "off") return { status: "off" };
	if (cfg.kind === "misconfigured") {
		console.warn("[boosttape] x402 env present but incomplete or invalid");
		return { status: "failed" };
	}
	try {
		const [{ createX402Server }, { declareDiscoveryExtension }] = await Promise.all([import("../_libs/@coinbase/cdp-sdk+[...].mjs").then((n) => n.t), import("../_libs/@coinbase/cdp-sdk+[...].mjs").then((n) => n.n)]);
		const bazaar = declareDiscoveryExtension({
			input: {
				chain: "all",
				type: "all",
				limit: "5",
				min_liq: "5000",
				since: "2026-09-13T00:00:00.000Z"
			},
			inputSchema: { properties: {
				chain: {
					type: "string",
					enum: [
						"solana",
						"base",
						"robinhood",
						"all"
					],
					description: "DexScreener chain filter. Data rail, not payment rail."
				},
				type: {
					type: "string",
					enum: [
						"boost",
						"profile",
						"paid",
						"all"
					]
				},
				limit: {
					type: "string",
					description: "Integer 3..10"
				},
				min_liq: {
					type: "string",
					description: "Drop when known liquidity is below this USD amount"
				},
				since: {
					type: "string",
					description: "ISO-8601 or unix seconds/ms. Only events after this timestamp."
				},
				since_timestamp: {
					type: "string",
					description: "Alias of since"
				},
				cursor: {
					type: "string",
					description: "Alias of since; pass next_since from the previous response"
				}
			} },
			output: { example: bazaarExample() }
		});
		return {
			status: "ready",
			server: await createX402Server({
				apiKeyId: cfg.apiKeyId,
				apiKeySecret: cfg.apiKeySecret,
				environment: "production",
				builderCode: "boosttape",
				payToConfig: {
					type: "address",
					evm: cfg.payTo
				},
				routes: { "GET /v1/events": {
					accepts: {
						scheme: "exact",
						price: X402_PRICE,
						network: X402_NETWORK,
						payTo: cfg.payTo,
						maxTimeoutSeconds: 300
					},
					description: "Recent DexScreener boost, profile, and paid promotion events with price reaction after the event.",
					mimeType: "application/json",
					serviceName: "BoostTape",
					tags: [
						"dexscreener",
						"boosts",
						"agents",
						"x402"
					],
					extensions: bazaar,
					unpaidResponseBody: () => ({
						contentType: "application/json",
						body: {
							error: "payment_required",
							message: `GET /v1/events costs ${X402_PRICE} USDC on Base. Retry with a PAYMENT-SIGNATURE header.`,
							price: X402_PRICE,
							network: X402_NETWORK,
							asset: X402_ASSET
						}
					})
				} }
			})
		};
	} catch {
		console.warn("[boosttape] x402 init failed");
		return { status: "failed" };
	}
}
function getServerState() {
	if (!boot) boot = bootServer();
	return boot;
}
async function gateEventsRequest(request) {
	const state = await getServerState();
	if (state.status === "off") return { kind: "free" };
	if (state.status === "failed") return {
		kind: "blocked",
		response: paymentUnavailable()
	};
	const url = new URL(request.url);
	const context = {
		adapter: adapterFromRequest(request),
		path: url.pathname,
		method: request.method
	};
	let result;
	try {
		result = await state.server.processHTTPRequest(context);
	} catch {
		console.warn("[boosttape] x402 verify failed");
		return {
			kind: "blocked",
			response: paymentUnavailable()
		};
	}
	if (result.type === "no-payment-required") return { kind: "free" };
	if (result.type === "payment-error") return {
		kind: "blocked",
		response: responseFromInstructions(result.response)
	};
	const verified = result;
	return {
		kind: "paid",
		respond: async (body) => {
			let settle;
			try {
				settle = await state.server.processSettlement(verified.paymentPayload, verified.paymentRequirements, verified.declaredExtensions, { request: context }, void 0, verified.beforeHandlerSettlement);
			} catch {
				console.warn("[boosttape] x402 settle failed");
				return paymentUnavailable();
			}
			if (!settle.success) {
				if (settle.response) return responseFromInstructions(settle.response);
				return paymentUnavailable();
			}
			return jsonResponse(body, {
				cache: "no-store",
				headers: settle.headers ?? {}
			});
		},
		abort: async () => {
			try {
				await verified.cancellationDispatcher?.cancel?.();
			} catch {}
		}
	};
}
var Route = createFileRoute("/v1/events")({ server: { handlers: {
	OPTIONS: () => corsPreflight(),
	GET: async ({ request }) => {
		const parsed = parseEventsQuery(new URL(request.url));
		if (!parsed.ok) return jsonResponse({
			error: "invalid_query",
			message: parsed.error
		}, {
			status: 400,
			cache: "no-store"
		});
		const gate = await gateEventsRequest(request);
		if (gate.kind === "blocked") return gate.response;
		try {
			try {
				await ensureFresh();
			} catch (err) {
				console.warn("[boosttape] events refresh failed", err);
			}
			const body = queryEvents(parsed.query);
			if (gate.kind === "paid") return gate.respond(body);
			return jsonResponse(body);
		} catch (err) {
			if (gate.kind === "paid") await gate.abort();
			console.warn("[boosttape] events handler failed", err);
			return jsonResponse({
				error: "unavailable",
				message: "events temporarily unavailable"
			}, {
				status: 503,
				cache: "no-store"
			});
		}
	}
} } });
var rootRouteChildren = {
	IndexRoute: Route$2.update({
		id: "/",
		path: "/",
		getParentRoute: () => Route$3
	}),
	HealthRoute: Route$1.update({
		id: "/health",
		path: "/health",
		getParentRoute: () => Route$3
	}),
	V1EventsRoute: Route.update({
		id: "/v1/events",
		path: "/v1/events",
		getParentRoute: () => Route$3
	})
};
var routeTree = Route$3._addFileChildren(rootRouteChildren)._addFileTypes();
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
function getRouter() {
	return createRouter({
		routeTree,
		defaultErrorComponent: AppErrorComponent
	});
}
//#endregion
export { Route$2 as n, router_exports as t };
