import { createServerFn } from "@tanstack/react-start";
import { ensureFresh } from "./collector.server";
import { paymentPublicStatus } from "./payment-status.server";
import { healthPayload, queryEvents } from "./query.server";

export const getLandingData = createServerFn({ method: "GET" }).handler(async () => {
  try {
    await ensureFresh();
  } catch (err) {
    console.warn("[boosttape] landing refresh failed", err);
  }
  return {
    health: healthPayload(),
    sample: queryEvents({ chain: "all", type: "all", limit: 5, min_liq: 5000, sinceMs: null }),
    payment: paymentPublicStatus(),
  };
});
