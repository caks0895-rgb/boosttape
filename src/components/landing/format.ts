import type { EventItem, FlagName } from "@/lib/boosttape/types";

export function fmtUsd(n: number | null): string {
  if (n == null) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(1)}k`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  if (n >= 0.0001) return `$${n.toFixed(4)}`;
  return `$${n.toExponential(1)}`;
}

export function fmtPct(n: number | null): string {
  if (n == null) return "—";
  const sign = n > 0 ? "+" : "";
  return `${sign}${n.toFixed(1)}%`;
}

export function pctTone(n: number | null): string {
  if (n == null) return "text-muted";
  if (n > 1) return "text-up";
  if (n < -1) return "text-down";
  return "text-muted";
}

export function ageLabel(min: number | null): string {
  if (min == null) return "—";
  if (min < 1) return "<1m";
  if (min < 60) return `${min}m`;
  const h = Math.round(min / 60);
  if (h < 48) return `${h}h`;
  return `${Math.round(h / 24)}d`;
}

export const FLAG_LABEL: Record<FlagName, string> = {
  thin_lp: "thin LP",
  dumped_after_boost: "dumped after boost",
  pumped_then_flat: "pumped then flat",
  too_new: "too new",
  missing_price: "missing price",
};

export function eventLabel(event: EventItem["event"]): string {
  return event;
}
