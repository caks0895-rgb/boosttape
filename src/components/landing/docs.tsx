import type { ReactNode } from "react";
import { X402_ASSET, X402_NETWORK, X402_PRICE } from "@/lib/boosttape/config";
import type { EventsResponse, HealthResponse, PaymentPublicStatus } from "@/lib/boosttape/types";
import { CopyButton } from "./copy-button";
import { Playground } from "./playground";

const EXAMPLE: EventsResponse = {
  as_of: "2026-09-13T00:00:00.000Z",
  since: null,
  next_since: "2026-09-13T00:00:00.000Z",
  count: 3,
  disclaimer: "DexScreener boost/profile/paid are promotions, not safety verification.",
  items: [
    {
      symbol: "BLUXEL",
      name: "Bluxel",
      chain: "solana",
      token: "E4LtkkDAv5fPL7N4zLZMnFgfwu6WjVRGKnjTbHVTpump",
      pair: "EML4Rfp59DACH61Wv94jE27kTbrchSCDZA9HnkmP84vg",
      dexscreener_url: "https://dexscreener.com/solana/eml4rfp59dach61wv94je27ktbrchscdza9hnkmp84vg",
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

export function Docs({
  origin,
  health,
  payment,
}: {
  origin: string;
  health: HealthResponse;
  payment: PaymentPublicStatus;
}) {
  const healthCurl = `curl -sS '${origin}/health'`;
  const eventsCurl = `curl -sS '${origin}/v1/events?chain=solana&type=boost&limit=5'`;
  const sinceCurl = `curl -sS '${origin}/v1/events?limit=5&since=2026-09-13T00:00:00.000Z'`;

  return (
    <div id="docs" className="mx-auto max-w-5xl px-4 pb-24 sm:px-6">
      <header className="max-w-2xl pt-16 sm:pt-24">
        <p className="font-mono text-[11px] tracking-[0.2em] text-accent uppercase">Documentation</p>
        <h2 className="mt-3 font-display text-4xl leading-tight text-fg italic sm:text-5xl">
          One useful endpoint. Then you pay.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-muted">
          BoostTape is a promotion-event feed, not a scanner, not an auditor. Agents ask which
          tokens were recently boosted, profile-updated, or paid on DexScreener, and get a short
          list with price reaction after the event.
        </p>
      </header>

      <section className="mt-12 grid gap-3 sm:grid-cols-3">
        <MetaCard k="health" v={health.last_poll_ok ? "poll ok" : "poll cold"} />
        <MetaCard k="cached" v={String(health.items_cached)} />
        <MetaCard
          k="x402"
          v={`${X402_PRICE} ${X402_ASSET}`}
        />
      </section>

      <Section title="Endpoints" kicker="01">
        <div className="overflow-hidden rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
          <Endpoint
            method="GET"
            path="/health"
            note="Free. Liveness and cache stats. No payment header."
            curl={healthCurl}
          />
          <Endpoint
            method="GET"
            path="/v1/events"
            note={`Paid. ${X402_PRICE} ${X402_ASSET} on Base (${X402_NETWORK}). Settled by an x402 facilitator.`}
            curl={eventsCurl}
            last
          />
        </div>
        <p className="mt-4 text-sm text-muted">
          Also published:{" "}
          <a className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent" href="/openapi.json">
            /openapi.json
          </a>{" "}
          and{" "}
          <a className="text-fg underline decoration-line underline-offset-4 hover:decoration-accent" href="/llms.txt">
            /llms.txt
          </a>{" "}
          for agents.
        </p>
      </Section>

      <Section title="Query string" kicker="02">
        <div className="overflow-x-auto rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <thead className="font-mono text-[11px] tracking-[0.14em] text-subtle uppercase">
              <tr className="border-b border-line">
                <th className="px-5 py-3 font-medium">Param</th>
                <th className="px-5 py-3 font-medium">Values</th>
                <th className="px-5 py-3 font-medium">Default</th>
              </tr>
            </thead>
            <tbody className="text-fg">
              <Row p="chain" v="solana | base | robinhood | all" d="all" />
              <Row p="type" v="boost | profile | paid | all" d="all" />
              <Row p="limit" v="integer 3..10" d="5" />
              <Row p="min_liq" v="number (USD)" d="5000" />
              <Row
                p="since"
                v="ISO-8601 or unix s/ms. Aliases: since_timestamp, cursor"
                d="omit"
              />
            </tbody>
          </table>
        </div>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-muted">
          Without <span className="font-mono text-fg">since</span>, the tape is unique-by-token,
          newest first. Pass <span className="font-mono text-fg">next_since</span> from the last
          response as <span className="font-mono text-fg">since</span> to receive only newer events
          — oldest-first, no gaps, empty <span className="font-mono text-fg">items</span> is a valid
          idle poll. Filter by chain to keep Solana noise out of a Base agent. Payment rail is Base
          USDC only. Data rail is any DexScreener chain — especially solana, robinhood, and base.
        </p>
        <pre className="mt-4 overflow-x-auto rounded-xl bg-bg-elev px-4 py-3 font-mono text-[12px] leading-relaxed text-accent shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
          {sinceCurl}
        </pre>
      </Section>

      <Section title="Flags" kicker="03">
        <ul className="grid gap-3 sm:grid-cols-2">
          <Flag
            name="thin_lp"
            body="Liquidity under $10k when known. Easy to move, easy to fake."
          />
          <Flag
            name="dumped_after_boost"
            body="Boost event and m5 ≤ −15% or h1 ≤ −20%. Paid visibility, then red."
          />
          <Flag
            name="pumped_then_flat"
            body="h1 ≥ +25% and m5 within ±3%. The burst already happened."
          />
          <Flag name="too_new" body="Pair created in the last 6 hours." />
          <Flag name="missing_price" body="DexScreener returned no USD price for the token." />
        </ul>
      </Section>

      <Section title="Response shape" kicker="04">
        <p className="mb-4 max-w-2xl text-sm leading-relaxed text-muted">
          Poll with <span className="font-mono text-fg">next_since</span>. Items below min_liq are
          dropped when liquidity is known; unknown liquidity is kept and flagged.
        </p>
        <pre className="max-h-[28rem] overflow-auto rounded-xl bg-bg-elev px-4 py-4 font-mono text-[11px] leading-relaxed text-fg/85 shadow-[0_0_0_1px_rgba(236,238,228,0.08)] sm:px-5">
          {JSON.stringify(EXAMPLE, null, 2)}
        </pre>
      </Section>

      <Section title="x402 payment" kicker="05">
        <ol className="grid gap-3">
          <Rule
            n="1"
            body={`${X402_PRICE} ${X402_ASSET} on Base (${X402_NETWORK}). Scheme exact. Settled by an x402 facilitator. /health stays free.`}
          />
          <Rule
            n="2"
            body="Unpaid calls get HTTP 402 with a PAYMENT-REQUIRED header. Pay, retry with PAYMENT-SIGNATURE. A successful settle returns PAYMENT-RESPONSE."
          />
          <Rule
            n="3"
            body="Bazaar discovery metadata is declared on GET /v1/events. Agents can index the resource from the 402 without a separate catalog call."
          />
        </ol>
      </Section>

      <Section title="Rules of the feed" kicker="06">
        <ol className="grid gap-3">
          <Rule n="1" body="Boost, profile, and paid are promotions. They are not a safety check, not an audit, not financial advice." />
          <Rule n="2" body="This is not a raw DexScreener proxy. Events are deduped by chain + token + type, junk-filtered, and annotated with price change after the event." />
          <Rule n="3" body="Payment and data are separate rails. Pay in Base USDC; read solana, robinhood, or base events." />
        </ol>
      </Section>

      <div className="mt-14">
        <Playground origin={origin} payment={payment} />
      </div>
    </div>
  );
}

function Section({
  title,
  kicker,
  children,
}: {
  title: string;
  kicker: string;
  children: ReactNode;
}) {
  return (
    <section className="mt-16 sm:mt-20">
      <div className="mb-5 flex items-baseline gap-3">
        <span className="font-mono text-[11px] tracking-[0.18em] text-subtle">{kicker}</span>
        <h3 className="font-display text-3xl italic text-fg">{title}</h3>
      </div>
      {children}
    </section>
  );
}

function MetaCard({ k, v }: { k: string; v: string }) {
  return (
    <div className="rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
      <p className="font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">{k}</p>
      <p className="mt-1 truncate font-mono text-sm text-fg tabular-nums">{v}</p>
    </div>
  );
}

function Endpoint({
  method,
  path,
  note,
  curl,
  last,
}: {
  method: string;
  path: string;
  note: string;
  curl: string;
  last?: boolean;
}) {
  return (
    <div className={last ? "p-4 sm:p-5" : "border-b border-line p-4 sm:p-5"}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="font-mono text-sm text-fg">
            <span className="text-accent">{method}</span> {path}
          </p>
          <p className="mt-1 text-sm text-muted">{note}</p>
        </div>
        <CopyButton text={curl} label="Copy" className="self-start bg-fg/10 text-fg hover:bg-fg/15" />
      </div>
    </div>
  );
}

function Row({ p, v, d }: { p: string; v: string; d: string }) {
  return (
    <tr className="border-b border-line last:border-0">
      <td className="px-5 py-3 font-mono text-accent">{p}</td>
      <td className="px-5 py-3 text-muted">{v}</td>
      <td className="px-5 py-3 font-mono text-fg">{d}</td>
    </tr>
  );
}

function Flag({ name, body }: { name: string; body: string }) {
  return (
    <li className="rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
      <p className="font-mono text-sm text-accent">{name}</p>
      <p className="mt-1.5 text-sm leading-relaxed text-muted">{body}</p>
    </li>
  );
}

function Rule({ n, body }: { n: string; body: string }) {
  return (
    <li className="flex gap-4 rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]">
      <span className="font-mono text-sm text-subtle">{n}</span>
      <p className="text-sm leading-relaxed text-fg/90">{body}</p>
    </li>
  );
}
