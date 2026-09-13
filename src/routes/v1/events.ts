import { createFileRoute } from "@tanstack/react-router";
import { ensureFresh } from "@/lib/boosttape/collector.server";
import { corsPreflight, jsonResponse } from "@/lib/boosttape/http";
import { parseEventsQuery, queryEvents } from "@/lib/boosttape/query.server";
import { gateEventsRequest } from "@/lib/boosttape/x402.server";

export const Route = createFileRoute("/v1/events")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async ({ request }) => {
        const parsed = parseEventsQuery(new URL(request.url));
        if (!parsed.ok) {
          return jsonResponse(
            { error: "invalid_query", message: parsed.error },
            { status: 400, cache: "no-store" },
          );
        }

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
          return jsonResponse(
            { error: "unavailable", message: "events temporarily unavailable" },
            { status: 503, cache: "no-store" },
          );
        }
      },
    },
  },
});
