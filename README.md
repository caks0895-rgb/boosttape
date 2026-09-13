# BoostTape

DexScreener promotion events for AI agents. Boost, profile, and paid — with price reaction after the event.

This is **not** financial advice and **not** a safety / audit score. DexScreener boost, profile, and paid placements are promotions.

## Run

```bash
npm install
npm run dev
```

App + API listen on the process port. Open `/` for the hero + full docs.

## Endpoints

| Method | Path | Notes |
| --- | --- | --- |
| GET | `/health` | Free. `{ ok, as_of, items_cached, last_poll_ok }` |
| GET | `/v1/events` | The product. `$0.005` USDC on Base when CDP keys are set |
| GET | `/openapi.json` | OpenAPI 3.1 |
| GET | `/llms.txt` | Agent-readable contract |

### curl

```bash
curl -sS '/health'
curl -sS '/v1/events?limit=5'
curl -sS '/v1/events?chain=solana&type=boost&limit=5'
curl -sS '/v1/events?chain=base&type=all&min_liq=10000'
curl -sS '/v1/events?limit=5&since=2026-09-13T00:00:00.000Z'
```

Replace the origin with wherever the app is hosted. After x402 is armed, unpaid `/v1/events` returns HTTP 402 with `PAYMENT-REQUIRED`. Agents retry with `PAYMENT-SIGNATURE`.

### Query

- `chain` = `solana` \| `base` \| `robinhood` \| `all` (default `all`)
- `type` = `boost` \| `profile` \| `paid` \| `all` (default `all`)
- `limit` = 3..10 (default 5)
- `min_liq` = number USD (default 5000). Dropped only when liquidity is known.
- `since` = ISO-8601 or unix seconds/ms. Aliases: `since_timestamp`, `cursor`.
  Without `since`: unique tokens, newest first, `next_since` = `as_of`.
  With `since`: only events after that timestamp, oldest first, no gaps. Pass `next_since` from the previous response. Empty `items` is a valid idle poll.

### Example JSON

```json
{
  "as_of": "2026-09-13T00:00:00.000Z",
  "since": null,
  "next_since": "2026-09-13T00:00:00.000Z",
  "count": 1,
  "disclaimer": "DexScreener boost/profile/paid are promotions, not safety verification.",
  "items": [
    {
      "symbol": "BLUXEL",
      "name": "Bluxel",
      "chain": "solana",
      "token": "E4LtkkDAv5fPL7N4zLZMnFgfwu6WjVRGKnjTbHVTpump",
      "pair": "EML4Rfp59DACH61Wv94jE27kTbrchSCDZA9HnkmP84vg",
      "dexscreener_url": "https://dexscreener.com/solana/eml4rfp59dach61wv94je27ktbrchscdza9hnkmp84vg",
      "event": "boost",
      "event_at": "2026-09-13T00:00:00.000Z",
      "age_min": 12,
      "liquidity_usd": 8591.69,
      "volume_24h_usd": 508.97,
      "price_usd": 0.000008296,
      "change_after": { "m5": 24.05, "h1": 24.05, "h6": 24.05 },
      "flags": ["thin_lp"]
    }
  ]
}
```

## How it works

Collector polls DexScreener public feeds (boosts + profiles) about every 45s, stores first-seen time as `event_at` when the upstream payload has no timestamp, snapshots price, then attaches DexScreener `priceChange` m5/h1/h6. Dedupes by chain + token + event type. Prefers unique tokens in one response unless `since` is set.

No DexScreener API key. Respect rate limits; cache is in-memory (fine for a single process). Filesystem SQLite is a later upgrade — Vercel cannot persist local files.

## x402 (operator)

Public copy only says the route is paid via an x402 facilitator. Do not put CDP key names, wallet env, or host setup on the site, OpenAPI, or llms.txt.

- Paid route: `GET /v1/events`
- Price: **`$0.005` USDC** on Base (`eip155:8453`). Charged ticket, not `$0.001`.
- Why `$0.005` instead of `$0.001`: CDP takes `$0.001` per settle after 1,000 free/month. A `$0.001` ticket nets ~$0 at scale. `$0.005` is 5× the fee (~80% after CDP) and still a micropayment if agents poll with `since`.
- Scheme: `exact`
- Facilitator: Coinbase CDP
- Bazaar: discovery metadata is declared on the route (query params, example output). Facilitators index it from the 402.
- `/health` stays free

Host env (server-only — never `VITE_` prefix, never commit, never log values, never mention on the public page):

| Name | Role |
| --- | --- |
| `CDP_API_KEY_ID` | Coinbase CDP API key id |
| `CDP_API_KEY_SECRET` | Coinbase CDP API key secret |
| `X402_PAY_TO` | Base USDC receiver, `0x` + 40 hex |

If none of those are set, `/v1/events` serves data so the hero and docs work. If they are set and valid, unpaid calls 402. If they are partially set or `X402_PAY_TO` is not an EVM address, `/v1/events` returns 503 `payment_unavailable` (fail-closed). Keys are read only in server modules and are not bundled to the client.

Payment rail and data rail stay separate: payment = Base USDC only; data = any DexScreener chain.

## Disclaimer

Boost / paid ≠ verified safe. Filter by `chain` when your agent only wants one venue.
