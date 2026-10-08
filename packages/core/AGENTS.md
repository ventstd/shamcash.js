# @ventstd/shamcash (server core)

## Overview

The server core. It holds the ShamCash `secretKey`, does Direct JWE encryption, and exposes typed calls such as `shamcash.bills.create()`. It is server only and has zero runtime dependencies.

## Key files

| File | Owns |
|---|---|
| `src/index.ts` | Public entry and the `ShamCash` class |
| `src/browser.ts` | Browser stub that throws at module load |
| `tsdown.config.ts` | Build config, ESM only output to `dist/` |
| `vitest.config.ts` | Test setup for Node and the workers pool |
| `test/node/guard.test.ts` | Checks the browser guard |

## Commands

```bash
pnpm --filter @ventstd/shamcash build
pnpm --filter @ventstd/shamcash test
pnpm --filter @ventstd/shamcash typecheck
pnpm --filter @ventstd/shamcash check:package
```

## Conventions

- The `browser` export condition points to a stub that throws at load. Real code never reaches browser bundles.
- The `ShamCash` constructor throws when both `window` and `document` exist. There is no escape hatch.
- Shared types live here. `react` and `next` import them with `import type`.
- Dependencies come in through constructors. The `fetch` option is the only way to change the HTTP transport.

## Gotchas

- Order matters in `package.json` `exports`. Runtime conditions (`workerd`, `worker`, `edge-light`, `deno`, `bun`, `node`) must come before `browser`, or real runtimes load the stub.
- Do not add `server-only` to core. It throws outside the `react-server` condition and would break plain Node, Express, and workers.
- Core has zero runtime dependencies. Adding one needs a decision in the spec first.

## Related specs

- [docs/specs/0001-stack-architecture/index.md](../../docs/specs/0001-stack-architecture/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
