# example-next (private example app)

## Overview

A private Next.js 16 App Router app. It uses the three workspace packages through `workspace:*` and proves each Tracer Bullet slice end to end before publish. It is never published.

## Key files

| File | Owns |
|---|---|
| `app/page.tsx` | Start page |
| `app/checkout.tsx` | Checkout UI built on the React hooks |
| `app/api/health/route.ts` | Health route |
| `next.config.ts` | Next.js config |

## Commands

```bash
# Build the packages first, then the example
pnpm build
pnpm build:example

# Dev server
pnpm --filter example-next dev

# Typecheck (runs next typegen, then tsc)
pnpm --filter example-next typecheck
```

## Conventions

- Depend on the packages with `workspace:*`. Never copy package code in.
- Route handlers come from `@ventstd/shamcash-next`. Do not call the ShamCash API by hand here.

## Gotchas

- The example builds against the workspace packages' `dist/` output. Run `pnpm build` before `build:example`, or it uses stale output.

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
