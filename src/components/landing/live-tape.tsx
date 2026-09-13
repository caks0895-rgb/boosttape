import type { EventItem } from "@/lib/boosttape/types";
import { ageLabel, eventLabel, FLAG_LABEL, fmtPct, fmtUsd, pctTone } from "./format";

export function LiveTape({ items }: { items: EventItem[] }) {
  if (items.length === 0) {
    return (
      <div className="rounded-xl bg-bg-elev px-5 py-10 text-center shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
        <p className="font-display text-xl text-fg italic">Tape is quiet.</p>
        <p className="mt-2 text-sm text-muted">
          Waiting on DexScreener. Refresh in a moment, or hit GET /health.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
      <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <p className="font-mono text-[11px] tracking-[0.18em] text-subtle uppercase">Live tape</p>
        <p className="font-mono text-[11px] text-subtle">{items.length} unique tokens</p>
      </div>
      <ul className="divide-y divide-line">
        {items.map((item) => (
          <li key={`${item.chain}:${item.token}:${item.event}`} className="stagger-in">
            <a
              href={item.dexscreener_url}
              target="_blank"
              rel="noreferrer"
              className="block px-4 py-4 transition-colors duration-150 hover:bg-fg/5 sm:px-5"
            >
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2">
                <div className="flex min-w-0 items-baseline gap-2.5">
                  <span className="font-mono text-[15px] font-medium tracking-tight text-fg">
                    {item.symbol}
                  </span>
                  <span className="truncate text-sm text-muted">{item.name ?? "—"}</span>
                </div>
                <div className="flex items-center gap-3 font-mono text-xs tabular-nums">
                  <span className={pctTone(item.change_after.m5)}>
                    m5 {fmtPct(item.change_after.m5)}
                  </span>
                  <span className={pctTone(item.change_after.h1)}>
                    h1 {fmtPct(item.change_after.h1)}
                  </span>
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-subtle">
                <span className="rounded-sm bg-fg/6 px-1.5 py-0.5 font-mono text-[11px] text-fg/80">
                  {eventLabel(item.event)}
                </span>
                <span className="font-mono">{item.chain}</span>
                <span>{ageLabel(item.age_min)}</span>
                <span>LP {fmtUsd(item.liquidity_usd)}</span>
                {item.flags.map((flag) => (
                  <span key={flag} className="text-warn">
                    {FLAG_LABEL[flag]}
                  </span>
                ))}
              </div>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
