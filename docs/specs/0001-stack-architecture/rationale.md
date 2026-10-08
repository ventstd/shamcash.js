# 0001. Rationale: stack and architecture

Decision record for [index.md](index.md). `/develop` skips this file.

## Context

shamcash.js is a free, open source TypeScript library for the ShamCash payment API. It works like stripe-node plus stripe.js together: server code holds the merchant `secretKey`, encrypts requests with Direct JWE, and calls the API, while browser code manages checkout state by calling the merchant's own server routes. The browser must never see the key. Target users are JavaScript developers on React and Next.js, but the server code must also run on edge runtimes, Deno, and Bun, because Next.js apps deploy there (basis: scope.md, feature 1 and feature 4).

The library moves money and handles a secret key for every app that installs it, so the project runs at the GA rigor tier. Two forces dominate. First, supply chain and leak safety: every dependency and every bundling mistake is a path to a merchant's key. Second, reach without fragility: the code has to load in Node, workers, and browser bundlers that each resolve packages differently, and it has to keep working as those tools change (basis: scope.md header).

The repo is empty except a stub `package.json` and the API doc. There is no `AGENTS.md` yet; conventions get captured from this scaffold by feature 2. The build approach is Tracer Bullet: each endpoint goes through crypto, typed server call, Next.js helper, React hook, and example app before the next starts, so the layout must make all layers buildable side by side from day one.

As of 2026-10-09: Node 20 is EOL (2026-04-30), Node 22 is Maintenance LTS until 2027-04-30, Node 24 is Active LTS. Next.js 16 is current and deprecates React 18. Node loads ESM from `require()` without a flag since 20.19 and 22.12. tsup has had no release since Nov 2025, while tsdown is active. Without a decision, every later feature would invent its own package boundary, format, and guard against leaking server code.

## Options considered

### Option 1: Three package pnpm monorepo, ESM only, tsdown, zero runtime deps

`packages/core`, `packages/react`, `packages/next` published separately under `@ventstd`, with a private example app and leak fixture. ESM only output from tsdown, Node `>=22.12`, Web Crypto and `fetch` only, Vitest with the Workers pool for edge proof (basis: separation of server and client code by package boundary).

**Pros**:
- Server code is physically in a different package from browser code; four guard layers stack on that boundary.
- Each package declares only the peers it needs (core has no React, react has no Next).
- One output format per package, no dual package hazard.
- Zero runtime deps for the key holding code.

**Cons**:
- More config: three manifests, three `exports` maps, lockstep releases.
- Users install two packages minimum (core plus react or next).
- tsdown is pre 1.0.

### Option 2: One package with subpath exports, dual ESM and CJS, tsup

A single `@ventstd/shamcash` with `./react` and `./next` subpaths, built by tsup to both ESM and CJS, React and Next as optional peers (basis: single package SDK layout, as in many payment SDKs).

**Pros**:
- One install, one version, one release.
- tsup is the most widely used library bundler, with years of fixes.
- CJS consumers on any Node version work.

**Cons**:
- Server and client code share a package; a wrong subpath import leaks server code with nothing structural to stop it.
- Optional peers for React and Next confuse package managers and users.
- Dual output risks two copies of the client class and doubles the `exports` surface.
- tsup has been quiet for almost a year.

### Option 3: Two packages (server core, browser bundle with React and Next helpers)

Core alone, then one package holding both React hooks and Next.js helpers.

**Pros**:
- Fewer packages than Option 1, still separates core.

**Cons**:
- Next.js route helpers are server code; putting them beside client hooks reintroduces the mixing Option 1 avoids.
- `next` becomes a peer for React only users.

### Option 4: Option 1 layout, but allow `jose` and a schema validator

Same three packages, but core depends on `jose` for JWE and Valibot or Zod for response validation (basis: reuse of audited crypto libraries).

**Pros**:
- Less crypto code to own; `jose` is widely audited and runs on edge.
- Schema validated responses with less hand written code.

**Cons**:
- Two runtime deps in the package that holds the key; their updates become your supply chain.
- Validator choice leaks into public types.
- Direct JWE with `dir` + `A256GCM` is one algorithm pair; Web Crypto covers it in a small amount of code.

## Rationale

Option 1 wins on the force that matters most: keeping the secret key code out of the browser. A package boundary is a structural guard; a subpath convention (Option 2) is only a habit. With core, react, and next separate, each guard layer (the `browser` export stub, the constructor check, `server-only` in next, type only imports in react) has a clean place to live, and the leak fixture can prove each one. Option 3 fails the same test because Next.js helpers are server code. (basis: defense in depth for secrets)

ESM only follows from the runtime floor. Node 20 is EOL, so supporting it would mean recommending an unpatched runtime for code that holds a secret key. With Node `>=22.12`, `require()` loads ESM without a flag, so the main argument for dual builds is gone, and so is the dual package hazard. tsdown was picked over tsup because new projects should not start on a bundler that has gone quiet; the pre 1.0 risk is handled with an exact pin. (basis: Node release schedule; Node 22.12 release notes)

Zero runtime deps (rejecting Option 4) keeps the supply chain of the key holding package empty. The engineer chose this. The cost is owning JWE code, which feature 4 must test against known vectors and on workerd. That is why the test stack pins Vitest at 4.1: the Workers pool is the only way here to prove the crypto on a real edge runtime, and it does not support Vitest 5 yet. Route handler factories on standard `Request`/`Response` beat server actions because webhooks need routes anyway, and HTTP routes work with any client. The class client mirrors stripe-node, which the scope names as the model. (basis: minimal dependencies for security sensitive code; stripe-node client pattern)

## References

**Project sources**:
- `docs/scope/scope.md`: header (build approach, GA tier), features 1, 3, 4, 5, 11
- `doc.pdf`: ShamCash API doc (Direct JWE, webhook 10 second window, no polling rule)
- Root `package.json`: repo URL `github.com/ventstd/shamcash.js`, MIT license

**Practices & standards**:
- Defense in depth for secrets (several independent guards on the key holding code)
- Minimal dependencies for security sensitive code
- Package boundary separation of server and client code
- stripe-node client pattern (class instance, grouped resources)
- Dual package hazard (avoid shipping two module formats of a stateful class)

**Links** (web verified in the Stage (c) landscape check, 2026-10-09):
- Node.js release schedule: https://github.com/nodejs/Release
- Node.js 22.12.0 release (require(esm) unflagged): https://nodejs.org/en/blog/release/v22.12.0
- Node.js 20.19.0 release: https://nodejs.org/en/blog/release/v20.19.0
- Next.js 16: https://nextjs.org/blog/next-16
- Next.js 16.4: https://nextjs.org/blog/next-16-4
- Next.js React version message: https://nextjs.org/docs/messages/react-version
- server-only on npm: https://www.npmjs.com/package/server-only
- tsdown releases: https://github.com/rolldown/tsdown/releases
- tsdown migrate from tsup: https://tsdown.dev/guide/migrate-from-tsup
- Workers Vitest integration, Vitest 4 migration: https://developers.cloudflare.com/workers/testing/vitest-integration/migration-guides/migrate-from-vitest-3-to-vitest-4/
- Workers pool and Vitest 5 issue: https://github.com/cloudflare/workers-sdk/issues/15618
