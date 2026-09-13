import {
  X402_ASSET,
  X402_NETWORK,
  X402_PRICE,
} from "./config";
import { CORS_HEADERS, jsonResponse } from "./http";
import { readPaymentConfig } from "./payment-status.server";
import { DISCLAIMER } from "./types";

type X402HttpServer = {
  processHTTPRequest: (
    context: {
      adapter: ReturnType<typeof adapterFromRequest>;
      path: string;
      method: string;
    },
  ) => Promise<HttpProcessResult>;
  processSettlement: (
    paymentPayload: unknown,
    requirements: unknown,
    declaredExtensions: unknown,
    transportContext: { request: { adapter: ReturnType<typeof adapterFromRequest>; path: string; method: string } },
    settlementOverrides: undefined,
    beforeHandlerSettlement: unknown,
  ) => Promise<{
    success: boolean;
    headers?: Record<string, string>;
    response?: { status: number; headers: Record<string, string>; body?: unknown; isHtml?: boolean };
  }>;
};

type HttpProcessResult =
  | { type: "no-payment-required" }
  | {
      type: "payment-verified";
      paymentPayload: unknown;
      paymentRequirements: unknown;
      declaredExtensions?: unknown;
      beforeHandlerSettlement?: unknown;
      cancellationDispatcher?: { cancel?: () => Promise<unknown> };
    }
  | {
      type: "payment-error";
      response: { status: number; headers: Record<string, string>; body?: unknown; isHtml?: boolean };
    };

export type EventsGate =
  | { kind: "free" }
  | { kind: "blocked"; response: Response }
  | {
      kind: "paid";
      respond: (body: unknown) => Promise<Response>;
      abort: () => Promise<void>;
    };

type ServerState =
  | { status: "off" }
  | { status: "failed" }
  | { status: "ready"; server: X402HttpServer };

let boot: Promise<ServerState> | null = null;

function adapterFromRequest(request: Request) {
  const url = new URL(request.url);
  return {
    getHeader: (name: string) => request.headers.get(name) ?? undefined,
    getMethod: () => request.method,
    getPath: () => url.pathname,
    getUrl: () => request.url,
    getAcceptHeader: () => request.headers.get("accept") ?? "",
    getUserAgent: () => request.headers.get("user-agent") ?? "",
    getQueryParams: () => {
      const out: Record<string, string> = {};
      url.searchParams.forEach((v, k) => {
        out[k] = v;
      });
      return out;
    },
    getQueryParam: (name: string) => url.searchParams.get(name) ?? undefined,
  };
}

function responseFromInstructions(instr: {
  status: number;
  headers: Record<string, string>;
  body?: unknown;
  isHtml?: boolean;
}): Response {
  const headers = new Headers(CORS_HEADERS);
  for (const [key, value] of Object.entries(instr.headers ?? {})) {
    headers.set(key, value);
  }
  if (!headers.has("cache-control")) {
    headers.set("cache-control", "no-store");
  }
  if (instr.isHtml) {
    if (!headers.has("content-type")) {
      headers.set("content-type", "text/html; charset=utf-8");
    }
    const html = typeof instr.body === "string" ? instr.body : "";
    return new Response(html, { status: instr.status, headers });
  }
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json; charset=utf-8");
  }
  const payload = instr.body === undefined ? {} : instr.body;
  const serialized = typeof payload === "string" ? payload : JSON.stringify(payload);
  return new Response(serialized, { status: instr.status, headers });
}

function paymentUnavailable(): Response {
  return jsonResponse(
    {
      error: "payment_unavailable",
      message: "Payment rail is not ready. GET /health stays free.",
    },
    { status: 503, cache: "no-store" },
  );
}

function bazaarExample() {
  return {
    as_of: "2026-09-13T00:00:00.000Z",
    since: null,
    next_since: "2026-09-13T00:00:00.000Z",
    count: 1,
    disclaimer: DISCLAIMER,
    items: [
      {
        symbol: "BLUXEL",
        name: "Bluxel",
        chain: "solana",
        token: "E4LtkkDAv5fPL7N4zLZMnFgfwu6WjVRGKnjTbHVTpump",
        pair: "EML4Rfp59DACH61Wv94jE27kTbrchSCDZA9HnkmP84vg",
        dexscreener_url:
          "https://dexscreener.com/solana/eml4rfp59dach61wv94je27ktbrchscdza9hnkmp84vg",
        event: "boost",
        event_at: "2026-09-13T00:00:00.000Z",
        age_min: 12,
        liquidity_usd: 8591.69,
        volume_24h_usd: 508.97,
        price_usd: 0.000008296,
        change_after: { m5: 24.05, h1: 24.05, h6: 24.05 },
        flags: ["thin_lp"],
      },
    ],
  };
}

async function bootServer(): Promise<ServerState> {
  const cfg = readPaymentConfig();
  if (cfg.kind === "off") return { status: "off" };
  if (cfg.kind === "misconfigured") {
    console.warn("[boosttape] x402 env present but incomplete or invalid");
    return { status: "failed" };
  }

  try {
    const [{ createX402Server }, { declareDiscoveryExtension }] = await Promise.all([
      import("@coinbase/cdp-sdk/x402"),
      import("@x402/extensions/bazaar"),
    ]);

    const bazaar = declareDiscoveryExtension({
      input: {
        chain: "all",
        type: "all",
        limit: "5",
        min_liq: "5000",
        since: "2026-09-13T00:00:00.000Z",
      },
      inputSchema: {
        properties: {
          chain: {
            type: "string",
            enum: ["solana", "base", "robinhood", "all"],
            description: "DexScreener chain filter. Data rail, not payment rail.",
          },
          type: { type: "string", enum: ["boost", "profile", "paid", "all"] },
          limit: { type: "string", description: "Integer 3..10" },
          min_liq: { type: "string", description: "Drop when known liquidity is below this USD amount" },
          since: {
            type: "string",
            description: "ISO-8601 or unix seconds/ms. Only events after this timestamp.",
          },
          since_timestamp: { type: "string", description: "Alias of since" },
          cursor: { type: "string", description: "Alias of since; pass next_since from the previous response" },
        },
      },
      output: { example: bazaarExample() },
    });

    const server = await createX402Server({
      apiKeyId: cfg.apiKeyId,
      apiKeySecret: cfg.apiKeySecret,
      environment: "production",
      builderCode: "boosttape",
      payToConfig: { type: "address", evm: cfg.payTo },
      routes: {
        "GET /v1/events": {
          accepts: {
            scheme: "exact",
            price: X402_PRICE,
            network: X402_NETWORK,
            payTo: cfg.payTo,
            maxTimeoutSeconds: 300,
          },
          description:
            "Recent DexScreener boost, profile, and paid promotion events with price reaction after the event.",
          mimeType: "application/json",
          serviceName: "BoostTape",
          tags: ["dexscreener", "boosts", "agents", "x402"],
          extensions: bazaar,
          unpaidResponseBody: () => ({
            contentType: "application/json",
            body: {
              error: "payment_required",
              message: `GET /v1/events costs ${X402_PRICE} USDC on Base. Retry with a PAYMENT-SIGNATURE header.`,
              price: X402_PRICE,
              network: X402_NETWORK,
              asset: X402_ASSET,
            },
          }),
        },
      },
    });

    return { status: "ready", server: server as unknown as X402HttpServer };
  } catch {
    console.warn("[boosttape] x402 init failed");
    return { status: "failed" };
  }
}

function getServerState(): Promise<ServerState> {
  if (!boot) boot = bootServer();
  return boot;
}

export async function gateEventsRequest(request: Request): Promise<EventsGate> {
  const state = await getServerState();
  if (state.status === "off") return { kind: "free" };
  if (state.status === "failed") {
    return { kind: "blocked", response: paymentUnavailable() };
  }

  const url = new URL(request.url);
  const context = {
    adapter: adapterFromRequest(request),
    path: url.pathname,
    method: request.method,
  };

  let result: HttpProcessResult;
  try {
    result = await state.server.processHTTPRequest(context);
  } catch {
    console.warn("[boosttape] x402 verify failed");
    return { kind: "blocked", response: paymentUnavailable() };
  }

  if (result.type === "no-payment-required") {
    return { kind: "free" };
  }

  if (result.type === "payment-error") {
    return { kind: "blocked", response: responseFromInstructions(result.response) };
  }

  const verified = result;
  return {
    kind: "paid",
    respond: async (body: unknown) => {
      let settle: Awaited<ReturnType<X402HttpServer["processSettlement"]>>;
      try {
        settle = await state.server.processSettlement(
          verified.paymentPayload,
          verified.paymentRequirements,
          verified.declaredExtensions,
          { request: context },
          undefined,
          verified.beforeHandlerSettlement,
        );
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
        headers: settle.headers ?? {},
      });
    },
    abort: async () => {
      try {
        await verified.cancellationDispatcher?.cancel?.();
      } catch {
        // already paid or facilitator declined cancel — do not leak details
      }
    },
  };
}
