import {
  DUMP_H1,
  DUMP_M5,
  FLAT_M5,
  PUMP_H1,
  THIN_LP_USD,
  TOO_NEW_MS,
} from "./config";
import type { FlagName, PromoEvent } from "./types";

export function computeFlags(input: {
  event: PromoEvent;
  liquidityUsd: number | null;
  priceUsd: number | null;
  changeM5: number | null;
  changeH1: number | null;
  pairCreatedAt: number | null;
  now: number;
}): FlagName[] {
  const flags: FlagName[] = [];
  if (input.liquidityUsd != null && input.liquidityUsd < THIN_LP_USD) {
    flags.push("thin_lp");
  }
  if (
    input.event === "boost" &&
    ((input.changeH1 != null && input.changeH1 <= DUMP_H1) ||
      (input.changeM5 != null && input.changeM5 <= DUMP_M5))
  ) {
    flags.push("dumped_after_boost");
  }
  if (
    input.changeH1 != null &&
    input.changeH1 >= PUMP_H1 &&
    input.changeM5 != null &&
    Math.abs(input.changeM5) <= FLAT_M5
  ) {
    flags.push("pumped_then_flat");
  }
  if (input.pairCreatedAt != null && input.now - input.pairCreatedAt < TOO_NEW_MS) {
    flags.push("too_new");
  }
  if (input.priceUsd == null) {
    flags.push("missing_price");
  }
  return flags;
}
