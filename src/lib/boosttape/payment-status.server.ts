import { env } from "@/lib/env.server";
import { X402_ASSET, X402_NETWORK, X402_PRICE } from "./config";
import type { PaymentPublicStatus } from "./types";

const PAY_TO_RE = /^0x[a-fA-F0-9]{40}$/;

export type PaymentConfigState =
  | { kind: "off" }
  | { kind: "ready"; apiKeyId: string; apiKeySecret: string; payTo: `0x${string}` }
  | { kind: "misconfigured" };

/**
 * Reads payment env. Values never leave this server module.
 * Armed only when all three are present and payTo is a valid EVM address.
 * Partial/invalid config is misconfigured (fail-closed on the paid route).
 */
export function readPaymentConfig(): PaymentConfigState {
  const apiKeyId = env("CDP_API_KEY_ID");
  const apiKeySecret = env("CDP_API_KEY_SECRET");
  const payTo = env("X402_PAY_TO");
  const present = [apiKeyId, apiKeySecret, payTo].filter(Boolean).length;
  if (present === 0) return { kind: "off" };
  if (!apiKeyId || !apiKeySecret || !payTo || !PAY_TO_RE.test(payTo)) {
    return { kind: "misconfigured" };
  }
  return {
    kind: "ready",
    apiKeyId,
    apiKeySecret,
    payTo: payTo as `0x${string}`,
  };
}

/** Public flags only. Never includes keys, payTo, or secret names' values. */
export function paymentPublicStatus(): PaymentPublicStatus {
  const cfg = readPaymentConfig();
  return {
    enabled: cfg.kind === "ready",
    price: X402_PRICE,
    network: X402_NETWORK,
    asset: X402_ASSET,
  };
}
