import { o as __toESM } from "../_runtime.mjs";
import { R as require_react, v as require_jsx_runtime } from "../_libs/@tanstack/react-router+[...].mjs";
import { a as X402_NETWORK, i as X402_ASSET, o as X402_PRICE, r as EVENT_TYPES, t as CHAINS } from "./query.server-DEuJnAZ-.mjs";
import { a as Activity, i as ArrowDown, n as Copy, r as Check } from "../_libs/lucide-react.mjs";
import { n as Route$2 } from "./router-DBQ0KJNw.mjs";
import { t as clsx } from "../_libs/clsx.mjs";
import { t as twMerge } from "../_libs/tailwind-merge.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-CIajaf1k.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
function CopyButton({ text, label = "Copy", className }) {
	const [copied, setCopied] = (0, import_react.useState)(false);
	async function onCopy() {
		try {
			await navigator.clipboard.writeText(text);
		} catch {
			const el = document.createElement("textarea");
			el.value = text;
			el.setAttribute("readonly", "");
			el.style.position = "absolute";
			el.style.left = "-9999px";
			document.body.appendChild(el);
			el.select();
			document.execCommand("copy");
			document.body.removeChild(el);
		}
		setCopied(true);
		window.setTimeout(() => setCopied(false), 1400);
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("button", {
		type: "button",
		onClick: () => void onCopy(),
		className: cn("inline-flex h-11 min-w-11 items-center justify-center gap-2 rounded-md px-3.5", "bg-fg text-bg-sunken text-sm font-medium", "transition-[opacity,transform] duration-150 ease-out", "hover:opacity-90 active:scale-[0.96]", className),
		children: [copied ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Check, {
			className: "size-4",
			strokeWidth: 2
		}) : /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Copy, {
			className: "size-4",
			strokeWidth: 2
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: copied ? "Copied" : label })]
	});
}
var CHAINS_UI = CHAINS;
var TYPES_UI = EVENT_TYPES;
function Playground({ origin, payment }) {
	const [chain, setChain] = (0, import_react.useState)("all");
	const [type, setType] = (0, import_react.useState)("all");
	const [limit, setLimit] = (0, import_react.useState)(5);
	const [since, setSince] = (0, import_react.useState)("");
	const [data, setData] = (0, import_react.useState)(null);
	const [status, setStatus] = (0, import_react.useState)(null);
	const [error, setError] = (0, import_react.useState)(null);
	const [loading, setLoading] = (0, import_react.useState)(false);
	const path = (0, import_react.useMemo)(() => {
		const q = new URLSearchParams({
			chain,
			type,
			limit: String(limit)
		});
		const trimmed = since.trim();
		if (trimmed) q.set("since", trimmed);
		return `/v1/events?${q.toString()}`;
	}, [
		chain,
		type,
		limit,
		since
	]);
	const curl = `curl -sS '${origin}${path}'`;
	async function run() {
		setLoading(true);
		setError(null);
		setStatus(null);
		try {
			const res = await fetch(path, { headers: { accept: "application/json" } });
			const json = await res.json();
			setStatus(res.status);
			setData(json);
			if (res.status === 402) {
				setError(`HTTP 402 — ${X402_PRICE} USDC on Base. Agents retry with PAYMENT-SIGNATURE.`);
				return;
			}
			if (!res.ok) {
				const message = json && typeof json === "object" && "message" in json && typeof json.message === "string" ? json.message : `HTTP ${res.status}`;
				setError(message);
			}
		} catch (err) {
			setError(err instanceof Error ? err.message : "request failed");
			setData(null);
		} finally {
			setLoading(false);
		}
	}
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg-elev p-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)] sm:p-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
					className: "font-display text-2xl text-fg italic",
					children: "Try the tape"
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-1 text-sm text-muted",
					children: ["Hits the real GET /v1/events from this origin.", payment.enabled ? ` Payment is live (${payment.price}). This browser fetch has no PAYMENT-SIGNATURE, so expect 402.` : " CDP keys are not set here, so the response is the data body."]
				})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
					text: curl,
					label: "Copy curl",
					className: "self-start sm:self-auto"
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
				className: "mt-5 grid gap-4 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "chain",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: chain,
							onChange: (v) => setChain(v),
							options: CHAINS_UI
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "type",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: type,
							onChange: (v) => setType(v),
							options: TYPES_UI
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
						label: "limit",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Select, {
							value: String(limit),
							onChange: (v) => setLimit(Number(v)),
							options: [
								"3",
								"4",
								"5",
								"6",
								"8",
								"10"
							]
						})
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-4",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Field, {
					label: "since (optional)",
					children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)("input", {
						value: since,
						onChange: (e) => setSince(e.target.value),
						placeholder: "ISO or unix — paste next_since to poll new events",
						suppressHydrationWarning: true,
						className: "h-11 w-full rounded-md bg-bg-sunken px-3 font-mono text-sm text-fg shadow-[0_0_0_1px_rgba(236,238,228,0.1)] outline-none transition-[box-shadow] duration-150 placeholder:text-subtle focus:shadow-[0_0_0_1px_rgba(143,160,134,0.7)]"
					})
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-4 overflow-x-auto rounded-lg bg-bg-sunken px-4 py-3 font-mono text-[12px] leading-relaxed text-accent shadow-[0_0_0_1px_rgba(236,238,228,0.06)]",
				children: curl
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("button", {
				type: "button",
				onClick: () => void run(),
				disabled: loading,
				className: "mt-4 flex h-11 w-fit items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-accent-fg transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.96] disabled:opacity-50",
				children: loading ? "Fetching…" : "Fetch events"
			}),
			error ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: `mt-4 text-sm ${status === 402 ? "text-warn" : "text-down"}`,
				children: error
			}) : null,
			data ? /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
				className: "mt-4 max-h-[28rem] overflow-auto rounded-lg bg-bg-sunken px-4 py-3 font-mono text-[11px] leading-relaxed text-fg/85 shadow-[0_0_0_1px_rgba(236,238,228,0.06)]",
				children: JSON.stringify(data, null, 2)
			}) : null
		]
	});
}
function Field({ label, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("label", {
		className: "block",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "mb-1.5 block font-mono text-[11px] tracking-[0.16em] text-subtle uppercase",
			children: label
		}), children]
	});
}
function Select({ value, onChange, options }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("select", {
		value,
		onChange: (e) => onChange(e.target.value),
		className: "h-11 w-full appearance-none rounded-md bg-bg-sunken px-3 font-mono text-sm text-fg shadow-[0_0_0_1px_rgba(236,238,228,0.1)] outline-none transition-[box-shadow] duration-150 focus:shadow-[0_0_0_1px_rgba(143,160,134,0.7)]",
		children: options.map((opt) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("option", {
			value: opt,
			children: opt
		}, opt))
	});
}
var EXAMPLE = {
	as_of: "2026-09-13T00:00:00.000Z",
	since: null,
	next_since: "2026-09-13T00:00:00.000Z",
	count: 3,
	disclaimer: "DexScreener boost/profile/paid are promotions, not safety verification.",
	items: [{
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
		price_usd: 8296e-9,
		change_after: {
			m5: 24.05,
			h1: 24.05,
			h6: 24.05
		},
		flags: ["thin_lp"]
	}]
};
function Docs({ origin, health, payment }) {
	const healthCurl = `curl -sS '${origin}/health'`;
	const eventsCurl = `curl -sS '${origin}/v1/events?chain=solana&type=boost&limit=5'`;
	const sinceCurl = `curl -sS '${origin}/v1/events?limit=5&since=2026-09-13T00:00:00.000Z'`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		id: "docs",
		className: "mx-auto max-w-5xl px-4 pb-24 sm:px-6",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "max-w-2xl pt-16 sm:pt-24",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono text-[11px] tracking-[0.2em] text-accent uppercase",
						children: "Documentation"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h2", {
						className: "mt-3 font-display text-4xl leading-tight text-fg italic sm:text-5xl",
						children: "One useful endpoint. Then you pay."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "mt-4 text-base leading-relaxed text-muted",
						children: "BoostTape is a promotion-event feed, not a scanner, not an auditor. Agents ask which tokens were recently boosted, profile-updated, or paid on DexScreener, and get a short list with price reaction after the event."
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "mt-12 grid gap-3 sm:grid-cols-3",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCard, {
						k: "health",
						v: health.last_poll_ok ? "poll ok" : "poll cold"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCard, {
						k: "cached",
						v: String(health.items_cached)
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)(MetaCard, {
						k: "x402",
						v: payment.enabled ? `${payment.price} live` : `${X402_PRICE} standby`
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Endpoints",
				kicker: "01",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "overflow-hidden rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Endpoint, {
						method: "GET",
						path: "/health",
						note: "Free. Liveness and cache stats. No payment header.",
						curl: healthCurl
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Endpoint, {
						method: "GET",
						path: "/v1/events",
						note: `${payment.enabled ? "Paid." : "Paid when CDP keys are set."} ${X402_PRICE} ${X402_ASSET} on Base (${X402_NETWORK}). Bazaar discovery is declared on the 402.`,
						curl: eventsCurl,
						last: true
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mt-4 text-sm text-muted",
					children: [
						"Also published:",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-fg underline decoration-line underline-offset-4 hover:decoration-accent",
							href: "/openapi.json",
							children: "/openapi.json"
						}),
						" ",
						"and",
						" ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
							className: "text-fg underline decoration-line underline-offset-4 hover:decoration-accent",
							href: "/llms.txt",
							children: "/llms.txt"
						}),
						" ",
						"for agents."
					]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Query string",
				kicker: "02",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
						className: "overflow-x-auto rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
						children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("table", {
							className: "w-full min-w-[36rem] text-left text-sm",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("thead", {
								className: "font-mono text-[11px] tracking-[0.14em] text-subtle uppercase",
								children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
									className: "border-b border-line",
									children: [
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Param"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Values"
										}),
										/* @__PURE__ */ (0, import_jsx_runtime.jsx)("th", {
											className: "px-5 py-3 font-medium",
											children: "Default"
										})
									]
								})
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tbody", {
								className: "text-fg",
								children: [
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										p: "chain",
										v: "solana | base | robinhood | all",
										d: "all"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										p: "type",
										v: "boost | profile | paid | all",
										d: "all"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										p: "limit",
										v: "integer 3..10",
										d: "5"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										p: "min_liq",
										v: "number (USD)",
										d: "5000"
									}),
									/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Row, {
										p: "since",
										v: "ISO-8601 or unix s/ms. Aliases: since_timestamp, cursor",
										d: "omit"
									})
								]
							})]
						})
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
						className: "mt-4 max-w-2xl text-sm leading-relaxed text-muted",
						children: [
							"Without ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "since"
							}),
							", the tape is unique-by-token, newest first. Pass ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "next_since"
							}),
							" from the last response as ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "since"
							}),
							" to receive only newer events — oldest-first, no gaps, empty ",
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-fg",
								children: "items"
							}),
							" is a valid idle poll. Filter by chain to keep Solana noise out of a Base agent. Payment rail is Base USDC only. Data rail is any DexScreener chain — especially solana, robinhood, and base."
						]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
						className: "mt-4 overflow-x-auto rounded-xl bg-bg-elev px-4 py-3 font-mono text-[12px] leading-relaxed text-accent shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
						children: sinceCurl
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Flags",
				kicker: "03",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ul", {
					className: "grid gap-3 sm:grid-cols-2",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
							name: "thin_lp",
							body: "Liquidity under $10k when known. Easy to move, easy to fake."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
							name: "dumped_after_boost",
							body: "Boost event and m5 ≤ −15% or h1 ≤ −20%. Paid visibility, then red."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
							name: "pumped_then_flat",
							body: "h1 ≥ +25% and m5 within ±3%. The burst already happened."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
							name: "too_new",
							body: "Pair created in the last 6 hours."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Flag, {
							name: "missing_price",
							body: "DexScreener returned no USD price for the token."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "Response shape",
				kicker: "04",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
					className: "mb-4 max-w-2xl text-sm leading-relaxed text-muted",
					children: [
						"Poll with ",
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
							className: "font-mono text-fg",
							children: "next_since"
						}),
						". Items below min_liq are dropped when liquidity is known; unknown liquidity is kept and flagged."
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("pre", {
					className: "max-h-[28rem] overflow-auto rounded-xl bg-bg-elev px-4 py-4 font-mono text-[11px] leading-relaxed text-fg/85 shadow-[0_0_0_1px_rgba(236,238,228,0.08)] sm:px-5",
					children: JSON.stringify(EXAMPLE, null, 2)
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)(Section, {
				title: "x402 payment",
				kicker: "05",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "1",
							body: `${X402_PRICE} ${X402_ASSET} on Base (${X402_NETWORK}). Scheme exact. Facilitator is Coinbase CDP. /health stays free.`
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "2",
							body: "Unpaid calls get HTTP 402 with a PAYMENT-REQUIRED header. Pay, retry with PAYMENT-SIGNATURE. A successful settle returns PAYMENT-RESPONSE."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "3",
							body: "Bazaar discovery metadata is declared on GET /v1/events. Agents can index the resource from the 402 without a separate catalog call."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "4",
							body: "Set CDP_API_KEY_ID, CDP_API_KEY_SECRET, and X402_PAY_TO (Base receiver, 0x…) on the host. Never VITE_-prefix those names. They never ship to the browser."
						})
					]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-4 max-w-2xl text-sm leading-relaxed text-muted",
					children: payment.enabled ? "Payment is live on this origin. The playground below will 402 unless the client signs." : "Keys are not set on this origin, so the tape is served so you can read the contract. After CDP keys and X402_PAY_TO are set, the same path becomes paid."
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Section, {
				title: "Rules of the feed",
				kicker: "06",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("ol", {
					className: "grid gap-3",
					children: [
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "1",
							body: "Boost, profile, and paid are promotions. They are not a safety check, not an audit, not financial advice."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "2",
							body: "This is not a raw DexScreener proxy. Events are deduped by chain + token + type, junk-filtered, and annotated with price change after the event."
						}),
						/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Rule, {
							n: "3",
							body: "Payment and data are separate rails. Pay in Base USDC; read solana, robinhood, or base events."
						})
					]
				})
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				className: "mt-14",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsx)(Playground, {
					origin,
					payment
				})
			})
		]
	});
}
function Section({ title, kicker, children }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
		className: "mt-16 sm:mt-20",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "mb-5 flex items-baseline gap-3",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
				className: "font-mono text-[11px] tracking-[0.18em] text-subtle",
				children: kicker
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("h3", {
				className: "font-display text-3xl italic text-fg",
				children: title
			})]
		}), children]
	});
}
function MetaCard({ k, v }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-[11px] tracking-[0.16em] text-subtle uppercase",
			children: k
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1 truncate font-mono text-sm text-fg tabular-nums",
			children: v
		})]
	});
}
function Endpoint({ method, path, note, curl, last }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
		className: last ? "p-4 sm:p-5" : "border-b border-line p-4 sm:p-5",
		children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", { children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-sm text-fg",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "text-accent",
						children: method
					}),
					" ",
					path
				]
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "mt-1 text-sm text-muted",
				children: note
			})] }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
				text: curl,
				label: "Copy",
				className: "self-start bg-fg/10 text-fg hover:bg-fg/15"
			})]
		})
	});
}
function Row({ p, v, d }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("tr", {
		className: "border-b border-line last:border-0",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-5 py-3 font-mono text-accent",
				children: p
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-5 py-3 text-muted",
				children: v
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("td", {
				className: "px-5 py-3 font-mono text-fg",
				children: d
			})
		]
	});
}
function Flag({ name, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-mono text-sm text-accent",
			children: name
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-1.5 text-sm leading-relaxed text-muted",
			children: body
		})]
	});
}
function Rule({ n, body }) {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("li", {
		className: "flex gap-4 rounded-lg bg-bg-elev px-4 py-4 shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
			className: "font-mono text-sm text-subtle",
			children: n
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "text-sm leading-relaxed text-fg/90",
			children: body
		})]
	});
}
function fmtUsd(n) {
	if (n == null) return "—";
	if (n >= 1e6) return `$${(n / 1e6).toFixed(2)}M`;
	if (n >= 1e3) return `$${(n / 1e3).toFixed(1)}k`;
	if (n >= 1) return `$${n.toFixed(2)}`;
	if (n >= 1e-4) return `$${n.toFixed(4)}`;
	return `$${n.toExponential(1)}`;
}
function fmtPct(n) {
	if (n == null) return "—";
	return `${n > 0 ? "+" : ""}${n.toFixed(1)}%`;
}
function pctTone(n) {
	if (n == null) return "text-muted";
	if (n > 1) return "text-up";
	if (n < -1) return "text-down";
	return "text-muted";
}
function ageLabel(min) {
	if (min == null) return "—";
	if (min < 1) return "<1m";
	if (min < 60) return `${min}m`;
	const h = Math.round(min / 60);
	if (h < 48) return `${h}h`;
	return `${Math.round(h / 24)}d`;
}
var FLAG_LABEL = {
	thin_lp: "thin LP",
	dumped_after_boost: "dumped after boost",
	pumped_then_flat: "pumped then flat",
	too_new: "too new",
	missing_price: "missing price"
};
function eventLabel(event) {
	return event;
}
function LiveTape({ items }) {
	if (items.length === 0) return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "rounded-xl bg-bg-elev px-5 py-10 text-center shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "font-display text-xl text-fg italic",
			children: "Tape is quiet."
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
			className: "mt-2 text-sm text-muted",
			children: "Waiting on DexScreener. Refresh in a moment, or hit GET /health."
		})]
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
		className: "overflow-hidden rounded-xl bg-bg-elev shadow-[0_0_0_1px_rgba(236,238,228,0.08)]",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
			className: "flex items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5",
			children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
				className: "font-mono text-[11px] tracking-[0.18em] text-subtle uppercase",
				children: "Live tape"
			}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("p", {
				className: "font-mono text-[11px] text-subtle",
				children: [items.length, " unique tokens"]
			})]
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("ul", {
			className: "divide-y divide-line",
			children: items.map((item) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("li", {
				className: "stagger-in",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: item.dexscreener_url,
					target: "_blank",
					rel: "noreferrer",
					className: "block px-4 py-4 transition-colors duration-150 hover:bg-fg/5 sm:px-5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "flex flex-wrap items-baseline justify-between gap-x-4 gap-y-2",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex min-w-0 items-baseline gap-2.5",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono text-[15px] font-medium tracking-tight text-fg",
								children: item.symbol
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "truncate text-sm text-muted",
								children: item.name ?? "—"
							})]
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
							className: "flex items-center gap-3 font-mono text-xs tabular-nums",
							children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: pctTone(item.change_after.m5),
								children: ["m5 ", fmtPct(item.change_after.m5)]
							}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: pctTone(item.change_after.h1),
								children: ["h1 ", fmtPct(item.change_after.h1)]
							})]
						})]
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "rounded-sm bg-fg/6 px-1.5 py-0.5 font-mono text-[11px] text-fg/80",
								children: eventLabel(item.event)
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "font-mono",
								children: item.chain
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: ageLabel(item.age_min) }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: ["LP ", fmtUsd(item.liquidity_usd)] }),
							item.flags.map((flag) => /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
								className: "text-warn",
								children: FLAG_LABEL[flag]
							}, flag))
						]
					})]
				})
			}, `${item.chain}:${item.token}:${item.event}`))
		})]
	});
}
function Home() {
	const { health, sample, payment } = Route$2.useLoaderData();
	const [origin, setOrigin] = (0, import_react.useState)("");
	(0, import_react.useEffect)(() => {
		setOrigin(window.location.origin);
	}, []);
	const curl = `${origin || ""}/v1/events?limit=5`;
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("main", {
		className: "min-h-dvh bg-bg text-fg",
		children: [
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("div", {
				"aria-hidden": true,
				className: "pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[linear-gradient(180deg,rgba(20,21,18,0.9)_0%,rgba(12,13,11,0)_100%)]"
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("header", {
				className: "relative mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-5 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
					href: "/",
					className: "flex items-center gap-2.5",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Mark, {}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", {
						className: "font-display text-xl tracking-tight text-fg italic",
						children: "BoostTape"
					})]
				}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("nav", {
					className: "flex items-center gap-2",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "#docs",
						className: "inline-flex h-11 items-center rounded-md px-3 text-sm text-muted transition-colors duration-150 hover:text-fg",
						children: "Docs"
					}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("a", {
						href: "/v1/events?limit=5",
						className: "inline-flex h-11 items-center rounded-md px-3 font-mono text-xs text-accent transition-colors duration-150 hover:text-fg",
						children: "GET /v1/events"
					})]
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mx-auto max-w-5xl px-4 pb-10 pt-8 sm:px-6 sm:pt-16",
				children: [
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "stagger-in font-mono text-[11px] tracking-[0.22em] text-accent uppercase",
						children: "Promotion-event API for agents"
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("h1", {
						className: "stagger-in mt-4 max-w-3xl font-display text-[2.75rem] leading-[1.05] tracking-[-0.03em] text-fg italic sm:text-6xl md:text-7xl",
						children: "Which tokens bought the timeline."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "stagger-in mt-6 max-w-xl text-base leading-relaxed text-muted sm:text-lg",
						children: "Recent DexScreener boost, profile, and paid events — deduplicated, junk-filtered, with price change after the event. Not a safety score. Not financial advice."
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stagger-in mt-8 flex flex-wrap items-center gap-3",
						children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(CopyButton, {
							text: `curl -sS '${curl}'`,
							label: "Copy curl"
						}), /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("a", {
							href: "#docs",
							className: "inline-flex h-11 items-center gap-2 rounded-md px-3.5 text-sm text-muted shadow-[0_0_0_1px_rgba(236,238,228,0.12)] transition-[color,box-shadow] duration-150 hover:text-fg hover:shadow-[0_0_0_1px_rgba(236,238,228,0.22)]",
							children: ["Read the contract", /* @__PURE__ */ (0, import_jsx_runtime.jsx)(ArrowDown, {
								className: "size-4",
								strokeWidth: 1.75
							})]
						})]
					}),
					/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
						className: "stagger-in mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 font-mono text-[11px] text-subtle",
						children: [
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", {
								className: "inline-flex items-center gap-1.5",
								children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Activity, {
									className: "size-3 text-accent",
									strokeWidth: 2
								}), health.last_poll_ok ? "collector live" : "collector warming"]
							}),
							/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("span", { children: [health.items_cached, " cached"] }),
							/* @__PURE__ */ (0, import_jsx_runtime.jsx)("span", { children: payment.enabled ? `${X402_PRICE} USDC · x402 live` : `${X402_PRICE} USDC · x402 standby` })
						]
					})
				]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsxs)("section", {
				className: "relative mx-auto max-w-5xl px-4 pb-4 sm:px-6",
				children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)(LiveTape, { items: sample.items }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
					className: "mt-3 text-xs text-subtle",
					children: sample.disclaimer
				})]
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)(Docs, {
				origin: origin || "",
				health,
				payment
			}),
			/* @__PURE__ */ (0, import_jsx_runtime.jsx)("footer", {
				className: "border-t border-line",
				children: /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("div", {
					className: "mx-auto flex max-w-5xl flex-col gap-2 px-4 py-8 text-xs text-subtle sm:flex-row sm:items-center sm:justify-between sm:px-6",
					children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", { children: "BoostTape · DexScreener promotions are paid attention, not verification." }), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("p", {
						className: "font-mono",
						children: "GET /health · GET /v1/events"
					})]
				})
			})
		]
	});
}
function Mark() {
	return /* @__PURE__ */ (0, import_jsx_runtime.jsxs)("svg", {
		width: "22",
		height: "22",
		viewBox: "0 0 22 22",
		fill: "none",
		"aria-hidden": true,
		className: "shrink-0",
		children: [/* @__PURE__ */ (0, import_jsx_runtime.jsx)("rect", {
			x: "1",
			y: "1",
			width: "20",
			height: "20",
			rx: "5",
			className: "stroke-line",
			strokeWidth: "1"
		}), /* @__PURE__ */ (0, import_jsx_runtime.jsx)("path", {
			d: "M6 8h10M6 11h7M6 14h4",
			className: "stroke-accent",
			strokeWidth: "1.5",
			strokeLinecap: "round"
		})]
	});
}
//#endregion
export { Home as component };
