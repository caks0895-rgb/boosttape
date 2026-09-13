import { useMemo, useState, type ReactNode } from "react";
import { X402_PRICE } from "@/lib/boosttape/config";
import type { ChainFilter, EventTypeFilter, PaymentPublicStatus } from "@/lib/boosttape/types";
import { CHAINS, EVENT_TYPES } from "@/lib/boosttape/types";
import { CopyButton } from "./copy-button";

const CHAINS_UI = CHAINS;
const TYPES_UI = EVENT_TYPES;

export function Playground({
  origin,
  payment,
}: {
  origin: string;
  payment: PaymentPublicStatus;
}) {
  const [chain, setChain] = useState<ChainFilter>("all");
  const [type, setType] = useState<EventTypeFilter>("all");
  const [limit, setLimit] = useState(5);
  const [since, setSince] = useState("");
  const [data, setData] = useState<unknown>(null);
  const [status, setStatus] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const path = useMemo(() => {
    const q = new URLSearchParams({
      chain,
      type,
      limit: String(limit),
    });
    const trimmed = since.trim();
    if (trimmed) q.set("since", trimmed);
    return `/v1/events?${q.toString()}`;
  }, [chain, type, limit, since]);

  const curl = `curl -sS '${origin}${path}'`;

  async function run() {
    setLoading(true);
    setError(null);
    setStatus(null);
    try {
      const res = await fetch(path, { headers: { accept: "application/json" } });
      const json: unknown = await res.json();
      setStatus(res.status);
      setData(json);
      if (res.status === 402) {
        setError(`HTTP 402 — ${X402_PRICE} USDC on Base. Agents retry with PAYMENT-SIGNATURE.`);
        return;
      }
      if (!res.ok) {
        const message =
          json &&
          typeof json === "object" &&
          "message" in json &&
          typeof json.message === "string"
            ? json.message
            : `HTTP ${res.status}`;
        setError(message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "request failed");
      setData(null);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl bg-bg-elev p-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)] sm:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h3 className="font-display text-2xl text-fg italic">Try the tape</h3>
          <p className="mt-1 text-sm text-muted">
            Hits the real GET /v1/events from this origin.
            {payment.enabled
              ? ` This browser fetch has no PAYMENT-SIGNATURE, so expect HTTP 402 (${payment.price} USDC, x402 facilitator).`
              : null}
          </p>
        </div>
        <CopyButton text={curl} label="Copy curl" className="self-start sm:self-auto" />
      </div>

      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <Field label="chain">
          <Select value={chain} onChange={(v) => setChain(v as ChainFilter)} options={CHAINS_UI} />
        </Field>
        <Field label="type">
          <Select value={type} onChange={(v) => setType(v as EventTypeFilter)} options={TYPES_UI} />
        </Field>
        <Field label="limit">
          <Select
            value={String(limit)}
            onChange={(v) => setLimit(Number(v))}
            options={["3", "4", "5", "6", "8", "10"]}
          />
        </Field>
      </div>

      <div className="mt-4">
        <Field label="since (optional)">
          <input
            value={since}
            onChange={(e) => setSince(e.target.value)}
            placeholder="ISO or unix — paste next_since to poll new events"
            suppressHydrationWarning
            className="h-11 w-full rounded-md bg-bg-sunken px-3 font-mono text-sm text-fg shadow-[0_0_0_1px_rgba(236,238,228,0.1)] outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus:shadow-[0_0_0_1px_rgba(143,160,134,0.7)]"

          />
        </Field>
      </div>

      <pre className="mt-4 overflow-x-auto rounded-lg bg-bg-sunken px-4 py-3 font-mono text-[12px] leading-relaxed text-accent shadow-[0_0_0_1px_rgba(236,238,228,0.06)]">
        {curl}
      </pre>

      <button
        type="button"
        onClick={() => void run()}
        disabled={loading}
        className="mt-4 flex h-11 w-fit items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-50"
      >
        {loading ? "Fetching…" : "Fetch events"}
      </button>

      {error ? (
        <p className={`mt-4 text-sm ${status === 402 ? "text-warn" : "text-down"}`}>{error}</p>
      ) : null}

      {data ? (
        <pre className="mt-4 max-h-[28rem] overflow-auto rounded-lg bg-bg-sunken px-4 py-3 font-mono text-[11px] leading-relaxed text-fg/85 shadow-[0_0_0_1px_rgba(236,238,228,0.06)]">
          {JSON.stringify(data, null, 2)}
        </pre>
      ) : null}
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block font-mono text-[11px] tracking-[0.16em] text-subtle uppercase">
        {label}
      </span>
      {children}
    </label>
  );
}

function Select({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: readonly string[];
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-11 w-full appearance-none rounded-md bg-bg-sunken px-3 font-mono text-sm text-fg shadow-[0_0_0_1px_rgba(236,238,228,0.1)] outline-none transition-[box-shadow] duration-150 focus:shadow-[0_0_0_1px_rgba(143,160,134,0.7)]"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
