# @ventstd/shamcash-next (Next.js helpers)

## Overview

Next.js route handler helpers for ShamCash bills and webhooks. It is server only and holds the secret key through core. Route factories take and return standard `Request` and `Response`, so they run on both `nodejs` and `edge` route runtimes.

## Key files

| File | Owns |
|---|---|
| `src/index.ts` | Public entry: route handler factories |
| `tsdown.config.ts` | Build config, ESM only output to `dist/` |
| `test/package.test.ts` | Package output checks |

## Commands

```bash
pnpm --filter @ventstd/shamcash-next build
pnpm --filter @ventstd/shamcash-next test
pnpm --filter @ventstd/shamcash-next typecheck
pnpm --filter @ventstd/shamcash-next check:package
```

## Conventions

- Every entry imports `server-only`, so Next.js fails the build when a client component imports it.
- Use `Request` and `Response`, never `NextRequest`, so the helpers stay independent of Next internals.
- Peer deps: `next` `^15 || ^16`, `react` `^19`, and `@ventstd/shamcash` `workspace:^`.

## Gotchas

- `server-only` belongs here only. Core must not import it (see `packages/core/AGENTS.md`).

## Related specs

- [docs/specs/0001-stack-architecture/index.md](../../docs/specs/0001-stack-architecture/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
