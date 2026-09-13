import { createFileRoute } from "@tanstack/react-router";
import { ensureFresh } from "@/lib/boosttape/collector.server";
import { corsPreflight, jsonResponse } from "@/lib/boosttape/http";
import { healthPayload } from "@/lib/boosttape/query.server";

export const Route = createFileRoute("/health")({
  server: {
    handlers: {
      OPTIONS: () => corsPreflight(),
      GET: async () => {
        try {
          await ensureFresh();
        } catch (err) {
          console.warn("[boosttape] health refresh failed", err);
        }
        return jsonResponse(healthPayload(), { cache: "no-store" });
      },
    },
  },
});
