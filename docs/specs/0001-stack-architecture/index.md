# 0001. Ship shamcash.js as a three package pnpm monorepo of ESM only TypeScript

**Date**: 2026-10-09
**Status**: In Progress

## Summary

shamcash.js ships as three npm packages in one pnpm workspace (a repo holding several packages that build together): a server core that holds the secret key, a React hooks package for the browser, and a Next.js helpers package for route handlers. Everything is strict TypeScript, built with tsdown into ESM only output (modern JavaScript modules, no old CommonJS copy), and has zero runtime dependencies. The split, plus four layered guards, keeps the secret key code out of browser bundles. Building means scaffolding these packages, the example app, and a leak check fixture so the empty packages build, type check, and fail loudly when misused.

## Decision

**Chosen option**: Option 1: Three package pnpm monorepo, ESM only, tsdown, zero runtime deps.

Ship `@ventstd/shamcash` (server core), `@ventstd/shamcash-react` (client hooks), and `@ventstd/shamcash-next` (Next.js server helpers) from one pnpm workspace, versioned in lockstep, built with tsdown to ESM only, tested with Vitest plus the Cloudflare Workers pool, targeting Node `>=22.12`, Deno, Bun, and edge runtimes.

## Proposed stack

| Layer | Choice | Reason |
|---|---|---|
| Language | TypeScript, strict, shared `tsconfig.base.json` | Type safety is the product promise; one strict base keeps all packages on the same rules. |
| Package layout | Monorepo, 3 published packages + private example and fixture apps | Separates server and browser code physically and gives each package honest peer deps. |
| Package names | `@ventstd/shamcash`, `@ventstd/shamcash-react`, `@ventstd/shamcash-next` | Own npm scope reads as clearly third party, not official ShamCash. |
| Package manager | pnpm workspaces, version pinned in root `packageManager` | Strict `node_modules` catches undeclared deps before users hit them; `workspace:*` links packages. |
| Task runner | `pnpm -r` (recursive, topological order) | Four workspaces need no cache layer; add Turborepo only if CI gets slow. |
| Bundler | tsdown, exact version pin (0.23.x line at scaffold time) | Active Rolldown based bundler with fast `.d.ts` output; pre 1.0, so pinned. |
| Module format | ESM only, no top level await anywhere | Node 22.12+ loads ESM from `require()`, so CJS users still work; avoids the dual package hazard (two copies of the client class). |
| Runtime floor (core) | Node `>=22.12`, Deno 2+, Bun 1.2+, Vercel Edge, Cloudflare Workers | Oldest supported Node LTS (EOL 2027-04-30); all have Web Crypto and `fetch`. |
| Runtime deps (core) | None. Web Crypto + `fetch` only | Smallest supply chain for code holding a secret key; JWE and validation are hand written. |
| HTTP transport | `globalThis.fetch` by default, overridable via `fetch` option in client config | Works on every runtime, easy to mock, lets users add proxies or timeouts. |
| Server client API | Class: `new ShamCash({ secretKey, ... })`, resources grouped (`shamcash.bills.create()`) | Mirrors stripe-node, the model the scope names. |
| React layer | Context provider + hooks on `useReducer`, zero deps, whole package marked `'use client'` | Checkout is a small state machine; no caching library needed since the doc forbids polling. |
| Next.js layer | Route handler factories on standard `Request`/`Response`, package imports `server-only` | Hooks call your own routes over HTTP; same shape serves webhooks; runs on Node and edge route runtimes. |
| Shared types | Live in core; react uses `import type` only | Single source of truth; type imports vanish at build, so no core runtime reaches the browser. |
| Peer deps | react: `@ventstd/shamcash`, `react ^19`; next: `@ventstd/shamcash`, `next ^15 \|\| ^16`, `react ^19` | One core copy per app; users control versions. |
| Versioning | Lockstep, one version for all three packages | Scope asks for matching versions. Tooling decided in the Release automation spec. |
| Tests | Vitest pinned `~4.1` (node env for core and next, jsdom for react) + `@cloudflare/vitest-pool-workers` for core on workerd | Real edge runtime proof for crypto; pool does not support Vitest 5 yet. |
| Package output checks | `publint` + `@arethetypeswrong/cli` on every package | Catches broken `exports` maps and type resolution before publish. |
| Example app | `examples/next` (private, Next.js 16 App Router, `workspace:*` deps) | Proves each Tracer Bullet slice end to end before publish. |

**Repo layout:**

```
pnpm-workspace.yaml        packages/*, examples/*, fixtures/*
package.json               private root, "type": "module", packageManager pinned
tsconfig.base.json
packages/core/             @ventstd/shamcash
packages/react/            @ventstd/shamcash-react
packages/next/             @ventstd/shamcash-next
examples/next/             private example app
fixtures/client-leak/      private Next app that misuses core on purpose
```

The existing root `package.json` (`"main": "index.js"`, `"type": "commonjs"`) becomes the private workspace root; it is not published.

**TypeScript base options:** `strict`, `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`, `isolatedDeclarations`, `module: "preserve"`, `moduleResolution: "bundler"`, `target: "ES2023"`, `lib: ["ES2023", "DOM"]` only where a package needs DOM types (react). Type check runs `tsc --noEmit` per package; tsdown builds.

### Server code guard (four layers)

The secret key lives only in core and next. Four layers keep that code out of browsers:

1. **`server-only` in the next package.** Every entry of `@ventstd/shamcash-next` imports `server-only`, so Next.js fails the build when a client component imports it. (Not used in core: `server-only` throws on import outside the `react-server` condition, which would break core on plain Node, Express, and workers.)
2. **`browser` export condition stub in core.** Core's `exports` map sends the `browser` condition to a stub that throws `@ventstd/shamcash is server only. Import it in route handlers or server code, never in client components.` at module load. Runtime conditions are listed before `browser` so real runtimes never hit the stub:

   ```json
   "exports": {
     ".": {
       "types": "./dist/index.d.ts",
       "workerd": "./dist/index.js",
       "worker": "./dist/index.js",
       "edge-light": "./dist/index.js",
       "deno": "./dist/index.js",
       "bun": "./dist/index.js",
       "node": "./dist/index.js",
       "browser": "./dist/browser.js",
       "default": "./dist/index.js"
     }
   }
   ```

   Order matters: Wrangler and the Next.js edge compiler both include `browser` in their conditions, after `workerd`/`worker`/`edge-light`.
3. **Runtime check in the constructor.** `new ShamCash()` throws when `typeof window !== 'undefined' && typeof document !== 'undefined'`. No escape hatch option.
4. **No value imports from core in react.** The react package uses only `import type` from core. A lint rule (wired in feature 2) forbids value imports; the leak fixture proves it.

**Decided by the architect (recommend items):**
- Browser stub throws at module load, not at build. Build time failure for core would need `server-only` as a core dependency, breaking zero deps. Runner up: add `server-only` to the stub only. Revisit if users report silent leaks.
- `'use client'` is added as a tsdown output banner on the react package entry, since the whole package is client side. Runner up: per file directives, which bundlers can strip.
- Next route factories take and return standard `Request`/`Response`, never `NextRequest`, so they run on both `runtime = 'nodejs'` and `'edge'`. Runner up: `NextRequest` helpers, which tie the code to Next internals.
- Use string literal unions, not TS `enum`, for shared constants, so type only imports suffice in react. Runner up: `as const` objects exported from core, which would force a value import.

### What the scaffold must prove

From scope feature 1 *Done when*, checked by `/check verify`:

- `pnpm -r build` and `pnpm -r typecheck` pass with the empty packages.
- `publint` and `attw` pass on all three packages.
- Core's smoke test passes under both Vitest node env and the Workers pool (proves `exports` order picks the real entry on workerd).
- `fixtures/client-leak` imports `@ventstd/shamcash` in a `'use client'` component: its client bundle contains the stub error text and none of the core entry, and loading the page throws that error.
- `fixtures/client-leak` importing `@ventstd/shamcash-next` from a client component fails `next build`.
- `examples/next` builds against the workspace packages.

## Consequences

**Positive**:
- Secret key code cannot reach a browser bundle through a normal import mistake; four independent layers would all have to fail.
- Zero runtime deps: nothing extra to audit, nothing transitive to compromise.
- One ESM build per package: half the output and no dual package hazard.
- Same core runs on Node, Deno, Bun, and edge, proven in CI on workerd.

**Negative / tradeoffs**:
- Three packages mean three `package.json` files, three `exports` maps, and lockstep releases to keep in sync.
- Users on Node 20 or older cannot install it (Node 20 is EOL). CJS users on Node 22.0 to 22.11 get `ERR_REQUIRE_ESM`.
- tsdown is pre 1.0: minor bumps may break config; pinned, so upgrades are manual.
- Vitest held at 4.1 until the Workers pool supports 5.
- Core misuse in a client component fails at runtime in the browser, not at build time (see recommend items).
- Hand written JWE means owning crypto code (feature 4 must test it hard).
- Dropping Node 22 at its EOL (2027-04-30) is a breaking change: a major version bump.

**Neutral**:
- Root `package.json` changes from a CommonJS stub to a private ESM workspace root.
- Lint, format, CI wiring belong to feature 2 (`/audit`); release tooling to feature 11.
- React 18 and the Pages Router are not supported.

## Follow-up

- [ ] Claim the `@ventstd` npm org before the first publish (or pick another scope and update this spec).
- [ ] At scaffold, confirm exact versions with `npm view <pkg> version deprecated` for pnpm, tsdown, vitest, `@cloudflare/vitest-pool-workers`, publint, attw (the landscape check summarized registry data; not read raw).
- [ ] Scope feature 4 says "Node 18+"; it should read Node `>=22.12` to match this spec (`/scope` owns that file).
- [ ] Record in root `AGENTS.md` `## Agent skills`, `Declined:` line: Agent Skills and MCP discovery declined for pnpm, tsdown, TypeScript, Vitest, Workers pool, React 19, Next.js 16 (`/audit` or `/sync` writes it).
- [ ] Feature 2 (`/audit`): add the lint rule forbidding value imports from `@ventstd/shamcash` in `packages/react`, and run `publint`, `attw`, the Workers pool tests, and the leak fixture in CI. Add Deno and Bun smoke runs to the CI matrix.
- [ ] Revisit Vitest 5 once `@cloudflare/vitest-pool-workers` supports it.
- [ ] Plan the Node 22 drop as a major release before 2027-04-30.

## Rationale

Reasoning and options: see [rationale.md](rationale.md).
