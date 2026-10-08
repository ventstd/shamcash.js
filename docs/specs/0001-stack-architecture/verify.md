# Verify: Stack & architecture · spec 0001 · updated 2026-10-09
_Steps derived from spec 0001 `### What the scaffold must prove` (the spec has no numbered ACs; each step names the line it checks). `/check verify` runs these; `/test` locks the durable ones._

## UI / manual
- [x] `pnpm --filter client-leak build && pnpm --filter client-leak exec next start`, open `http://localhost:3000` in a browser → the console shows `@ventstd/shamcash is server only. Import it in route handlers or server code, never in client components.` → "loading the page throws that error"

## Commands
- [ ] `pnpm install` from a clean clone → installs with pnpm 12.10.1 (from `packageManager`), no ignored build script error → workspace runs
- [x] `pnpm build` → all three packages build to `dist/` (core has `index.js` and `browser.js`) → "`pnpm -r build` passes"
- [x] `pnpm typecheck` → all five workspaces pass, including both Next apps → "`pnpm -r typecheck` passes"
- [x] `pnpm check:packages` → `publint --strict` and `attw --profile esm-only` pass on all three packages → "publint and attw pass"
- [x] `pnpm --filter @ventstd/shamcash exec vitest run --reporter=verbose` → the smoke test passes under both `|node|` and `|workerd|` → "smoke test passes under Node and the Workers pool"
- [x] `pnpm test` → core (4), react (2: `'use client'` banner, no value import from core), next (1: `server-only` import kept) all pass → guard layers 1, 3, 4
- [x] `pnpm check:leak` → three ✓ lines: core in a client component ships only the stub; a named core import fails the Turbopack build; `@ventstd/shamcash-next` in a client component fails `next build` → "client bundle contains the stub and none of the core entry" and "importing next from a client component fails `next build`"
- [x] `pnpm build:example` → `examples/next` builds, routes `/` and `/api/health` → "`examples/next` builds against the workspace packages"

## Acceptance-criteria coverage
- `pnpm -r build` and `pnpm -r typecheck` pass: build and typecheck steps
- `publint` and `attw` pass: check:packages step
- Smoke test on Node and workerd: verbose vitest step
- Leak fixture, core in a client component (stub in bundle, page throws): check:leak step plus the manual browser step
- Leak fixture, next in a client component fails `next build`: check:leak step
- `examples/next` builds: build:example step
