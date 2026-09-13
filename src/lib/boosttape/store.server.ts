import { MAX_STORE } from "./config";
import type { StoredEvent } from "./types";

const events = new Map<string, StoredEvent>();

export type PollMeta = {
  lastPollAt: number | null;
  lastPollOk: boolean;
  lastError: string | null;
  startedAt: number;
};

export const pollMeta: PollMeta = {
  lastPollAt: null,
  lastPollOk: false,
  lastError: null,
  startedAt: Date.now(),
};

export function eventKey(chain: string, token: string, event: string): string {
  return `${chain.toLowerCase()}:${token.toLowerCase()}:${event}`;
}

export function upsertEvent(next: StoredEvent): StoredEvent {
  const prev = events.get(next.key);
  if (!prev) {
    events.set(next.key, next);
    evictIfNeeded();
    return next;
  }
  const merged: StoredEvent = {
    ...prev,
    ...next,
    eventAt: Math.min(prev.eventAt, next.eventAt),
    firstSeenAt: Math.min(prev.firstSeenAt, next.firstSeenAt),
    snapshotPriceUsd: prev.snapshotPriceUsd ?? next.snapshotPriceUsd,
    ordersChecked: prev.ordersChecked || next.ordersChecked,
  };
  events.set(next.key, merged);
  return merged;
}

export function getEvent(key: string): StoredEvent | undefined {
  return events.get(key);
}

export function allEvents(): StoredEvent[] {
  return [...events.values()];
}

export function storeSize(): number {
  return events.size;
}

function evictIfNeeded() {
  if (events.size <= MAX_STORE) return;
  const ranked = [...events.values()].sort((a, b) => a.eventAt - b.eventAt);
  const drop = events.size - MAX_STORE;
  for (let i = 0; i < drop; i++) {
    const item = ranked[i];
    if (item) events.delete(item.key);
  }
}
