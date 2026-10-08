# Scope: shamcash.js

A free, open source, type safe JavaScript library for the ShamCash e-payment API (see `doc.pdf`). It works like stripe-node plus stripe.js: a server core holds the `secretKey`, handles Direct JWE encryption, and exposes typed calls, and a headless React and Next.js layer manages checkout state in the browser by talking to your own server routes. The browser never sees the key. It's for JS developers who want to accept ShamCash payments in React and Next.js apps without calling the raw endpoints by hand.

**Build approach:** Tracer Bullet (vertical slices; each endpoint goes all the way through crypto, typed server call, Next.js helper, React hook, and example app, and works before the next one starts).
**Workflow:** GA (after develop: check verify, then test, then a fresh model check review, then document). The project default level of rigor, chosen because the library moves money and handles a secret key for every app that installs it. `/architect` is the recommended first stop for a feature with a real decision, but you can skip it when you already know the build. Any feature can carry its own tag (e.g. `· Alpha`) to do more or less.

_These are recommendations to keep your build orderly, not requirements. Skip anything that does not fit: if you already know how to build a feature, use `/develop` and skip `/architect`. You decide when a feature is `done`._

## At a glance

| # | Feature | Phase | Status |
|---|---------|-------|--------|
| 1 | Stack & architecture | Foundation | planned |
| 2 | Coding standards & tooling | Foundation | planned |
| 3 | API contract & error model | Foundation | planned |
| 4 | Direct JWE encryption | Foundation | planned |
| 5 | Create bill & redirect | Slice 1 | planned |
| 6 | Webhook handling | Slice 2 | planned |
| 7 | Bill status & return page | Slice 3 | planned |
| 8 | Refunds | Slice 4 | planned |
| 9 | Transactions & reconciliation | Slice 5 | planned |
| 10 | README & examples | Release | planned |
| 11 | Release automation | Release | planned |

## Foundations

### 1. Stack & architecture · needs a decision
Decide the package layout (server core, React layer, Next.js helpers), build output, and how server only code is kept out of browser bundles, then scaffold a runnable workspace.
**Done when:** the decision is in a spec, the empty packages build and type check, and importing the server core from a client component fails loudly instead of leaking the key.
- [ ] Decide the stack (spec): `/architect stack & architecture`

### 2. Coding standards & tooling · Alpha
Capture conventions from the real scaffold, then install lint, format, strict types, pre commit hooks, and CI that runs lint, type check, tests, and bundle size on every PR.
**Done when:** root `AGENTS.md` reflects the real stack, and lint, format, type check, and CI run clean on an empty PR.
- [ ] Capture conventions + tooling choices: `/audit`

### 3. API contract & error model · needs a decision
The typed shapes every feature builds on: request and response types for all four endpoints and the webhook, enums for bill status, currency, and transaction type, and one error model that separates HTTP transport failures from ShamCash `result` codes (1000 to 1708, 2500 success).
**Done when:** every documented field and code has a type, amounts keep exactly 2 decimals without float drift, a non 2500 result never looks like success even under HTTP 200, and errors are narrowable by code.
- [ ] Design it (spec): `/architect API contract & error model`

### 4. Direct JWE encryption · needs a decision
Encrypt request payloads and decrypt webhook payloads with Direct JWE (`dir` + `A256GCM`) using only standard Web Crypto, so it runs on Node 18+, edge runtimes, Deno, and Bun.
**Done when:** tokens match the doc's 5 part shape with an empty key segment, `iat`/`exp` are injected (exp 5 minutes after iat), expired or tampered tokens are rejected, and the same code passes on Node and an edge runtime.
- [ ] Design it (spec): `/architect direct JWE encryption`

## Slice 1: Create bill & redirect

### 5. Create bill & redirect · needs a decision
The thinnest real thread: a typed `createBill` on the server client, a Next.js route handler or server action that calls it, a React provider and `useCheckout` hook that track idle, creating, redirecting, and error, and a redirect to `paymentUrl` in the default browser. A minimal Next.js example app proves it against the sandbox. This slice is the walking skeleton.
**Done when:** in the example app, clicking Pay creates a sandbox bill and lands on the ShamCash checkout, the browser bundle holds no key, sandbox vs production is one config switch, and a retry that returns 1704 is treated as already created.
- [ ] Design it (spec): `/architect create bill & redirect`

## Slice 2: Webhook handling

### 6. Webhook handling · needs a decision
A drop in webhook handler (a plain function plus a Next.js route handler) that decrypts `encData`, rejects expired tokens, and gives you a typed paid or expired event to act on, returning 200 fast.
**Done when:** a valid paid or expired webhook reaches a typed callback, a tampered or expired token is rejected, the handler answers inside the 10 second window, and the docs show how to stay idempotent on retried events.
- [ ] Design it (spec): `/architect webhook handling`

## Slice 3: Bill status & return page

### 7. Bill status & return page · needs a decision
A typed `getBillInfo` on the server plus a `useBill` hook for the redirect return page, built around the doc's rule: trust the webhook, check status once as a fallback, never poll in a loop.
**Done when:** the return page shows pending, paid, expired, refunded, or partly refunded from a typed status, the library offers a single fallback check after the safety window, and no API in the library polls continuously.
- [ ] Design it (spec): `/architect bill status & return page`

## Slice 4: Refunds

### 8. Refunds · needs a decision
Typed `refundBill` for full and partial refunds, with idempotency keys generated safely by default and reused on retry, plus a Next.js server helper and a `useRefund` hook for merchant admin screens.
**Done when:** a partial and a full refund work in the sandbox, a retry with the same key returns the original result without a second transfer, amounts over 2 decimals are rejected before sending, and 1304, 1322, 1707, and 1708 surface as typed errors.
- [ ] Design it (spec): `/architect refunds`

## Slice 5: Transactions & reconciliation

### 9. Transactions & reconciliation · needs a decision
Typed `getTransactions` on the server with automatic cursor pagination (`afterTranId`), so end of day and monthly reconciliation is one loop instead of hand written paging.
**Done when:** you can iterate every payment and refund in a date range without managing cursors, date format and the limit range (10 to 2500) are validated before sending, and iteration stops cleanly when `hasMore` is false.
- [ ] Design it (spec): `/architect transactions & reconciliation`

## Release

### 10. README & examples · Alpha
A thorough README (install, server setup, Next.js and React usage, webhooks, refunds, reconciliation, key safety, sandbox testing with code `000000`), a typed API reference generated from the code, and the finished Next.js example app.
**Done when:** a new developer can go from install to a paid sandbox bill using only the README, and the README says clearly that this is a community library, not an official ShamCash product.
- [ ] Build it: `/develop README & examples`

### 11. Release automation · needs a decision
Versioned releases with changelogs, published to npm from CI, so people can trust what they install.
**Done when:** merging a release PR publishes all packages with matching versions and a changelog, and nothing publishes when CI fails.
- [ ] Design it (spec): `/architect release automation`

## Deferred
Out of scope for the current build pass, kept so the plan stays honest.
- **Framework agnostic browser client**: a plain JS client for Vue, Svelte, and vanilla sites, with the React layer on top · needs a decision
- **Other server adapters**: Express, Hono, and Fastify helpers for bill routes and webhooks · needs a decision
- **Local mock server**: fake bills, payments, expiry, and webhooks for offline tests and CI · needs a decision
- **Pay with ShamCash button**: optional UI using the official brand assets, with Arabic and RTL support · needs a decision
- **Docs site**: a dedicated site with guides and recipes · needs a decision

## Legend

**The decision box.** Every feature carries exactly one, the sub task whose label ends with `(spec)`. Its wording varies (`Design it (spec)` normally, `Decide the stack (spec)` on Stack & architecture), so skills locate it by that `(spec)` suffix, never by an exact label. Every other box is an execution box and `/architect` never ticks one.

**Feature lifecycle**: the scope updates as a feature moves; each row is what it shows and who sets it:

| State | Set by | The feature shows |
|---|---|---|
| `planned` · needs a decision | `/scope` | one box: `Design it (spec): /architect <feature>` |
| `in-progress` (designed) | **`/architect` at spec capture** | `Design it` ticked; spec linked; `Build it: /develop <feature>` + **2 to 5 milestones**; the tier's closing boxes (`Verify it` Alpha+, `Test it` Beta+, `Review it` + `Document it` GA); any surfaced follow up enrolled |
| `in-progress` (building) | `/develop` | milestone sub boxes tick one by one; code pointer filled |
| `in-progress` (verified) | `/check verify` | `Build it` + milestones ticked; `Verify it` ticked |
| `done` | **you, when you decide it is** (any skill sets it when you say so); `/sync` reconciles | boxes you ran ticked, skipped ones marked skipped; the tier's last stage (`Prototype` → after `/develop`; `Alpha` → after `/check verify`; `Beta`/`GA` → after `/test`) is the suggested point to call it done; `/sync` captures conventions |

- **Next step** = the first unticked box (always a command or a tracked milestone).
- **needs a decision** = run `/architect` first; otherwise straight to `/develop` (or `/audit` for standards & tooling). The tag drops once the spec is captured.
- **Atomic build tasks live in the spec's `## Build plan`, not here**: the scope carries only the milestone rollup.
- **Status** `planned` → `in-progress` → `done`, plus `existing` (pre workflow) and `dropped` (de scoped, kept for history).
- **Approach tag** beside a heading (e.g. `· Facade`) overrides the project default for that feature; no tag = inherits it.
- **Workflow tier tag** beside a heading (e.g. `· Alpha`) sets that one feature's rigor above or below the project default; no tag inherits the default. It decides the feature's check boxes and each skill's next suggestion.
- **Workflow** (header line) is the project default, what runs after `/develop`: **Prototype** = nothing (trust develop's own build time self check); **Alpha** = `/check verify`; **Beta** = `/check verify` then `/test`; **GA** = adds a fresh model `/check review` then `/document`. A feature built on an unratified decision (an `Assumed` spec) stays flagged, but that never blocks `done`.
- **Pointer line** (`spec <n> · code in <path>`): the spec link added by `/architect`, the code path by `/develop`.
