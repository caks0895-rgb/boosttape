import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowDown, Activity } from "lucide-react";
import { Docs } from "@/components/landing/docs";
import { CopyButton } from "@/components/landing/copy-button";
import { LiveTape } from "@/components/landing/live-tape";
import { X402_PRICE } from "@/lib/boosttape/config";
import { getLandingData } from "@/lib/boosttape/sample.functions";

export const Route = createFileRoute("/")({
  loader: () => getLandingData(),
  staleTime: 30_000,
  component: Home,
});

function Home() {
  const { health, sample, payment } = Route.useLoaderData();
  const [origin, setOrigin] = useState("");

  useEffect(() => {
    setOrigin(window.location.origin);
  }, []);

  const curl = `${origin || ""}/v1/events?limit=5`;

  return (
    <main className="min-h-dvh bg-bg text-fg">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[linear-gradient(180deg,rgba(20,21,18,0.9)_0%,rgba(12,13,11,0)_100%)]"
      />
      <header className="relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <a href="/" className="flex items-center gap-2.5">
          <Mark />
          <span className="font-display text-xl tracking-tight text-fg italic">BoostTape</span>
        </a>
        <nav className="flex items-center gap-2">
          <a
            href="#docs"
            className="inline-flex h-11 items-center rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:text-fg"
          >
            Docs
          </a>
          <a
            href="/v1/events?limit=5"
            className="inline-flex h-11 items-center rounded-md px-3 font-mono text-xs text-accent transition-colors duration-150 hover:text-fg"
          >
            GET /v1/events
          </a>
        </nav>
      </header>

      <section className="relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-16">
        <p className="stagger-in font-mono text-[11px] tracking-[0.22em] text-accent uppercase">
          Promotion-event API for agents
        </p>
        <h1 className="stagger-in mt-4 max-w-3xl font-display text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-fg italic sm:text-6xl md:text-7xl">
          Which tokens bought the timeline.
        </h1>
        <p className="stagger-in mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg">
          Recent DexScreener boost, profile, and paid events — deduplicated, junk-filtered, with
          price change after the event. Not a safety score. Not financial advice.
        </p>
        <div className="stagger-in mt-8 flex flex-wrap items-center gap-3">
          <CopyButton text={`curl -sS '${curl}'`} label="Copy curl" />
          <a
            href="#docs"
            className="inline-flex h-11 items-center gap-2 rounded-md px-3.5 text-sm text-muted shadow-[0_0_0_1px_rgba(236,238,228,0.12)] transition-[color,box-shadow] duration-150 hover:text-fg hover:shadow-[0_0_0_1px_rgba(236,238,228,0.22)]"
          >
            Read the contract
            <ArrowDown className="size-4" strokeWidth={1.75} />
          </a>
        </div>
        <div className="stagger-in mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-subtle">
          <span className="inline-flex items-center gap-1.5">
            <Activity className="size-3 text-accent" strokeWidth={2} />
            {health.last_poll_ok ? "collector live" : "collector warming"}
          </span>
          <span>{health.items_cached} cached</span>
          <span>
            {`${X402_PRICE} USDC · x402 facilitator`}
          </span>
        </div>
      </section>

      <section className="relative mx-auto max-w-5xl px-4 pb-4 sm:px-6">
        <LiveTape items={sample.items} />
        <p className="mt-3 text-xs text-subtle">{sample.disclaimer}</p>
      </section>

      <Docs origin={origin || ""} health={health} payment={payment} />

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>BoostTape · DexScreener promotions are paid attention, not verification.</p>
          <p className="font-mono">GET /health · GET /v1/events</p>
        </div>
      </footer>
    </main>
  );
}

function Mark() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden className="shrink-0">
      <rect x="1" y="1" width="20" height="20" rx="5" className="stroke-line" strokeWidth="1" />
      <path d="M6 8h10M6 11h7M6 14h4" className="stroke-accent" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
