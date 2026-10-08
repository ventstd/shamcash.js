# @ventstd/shamcash-react (React hooks)

## Overview

Headless React hooks and a context provider for ShamCash checkout. It calls your own server routes and never sees the secret key. The whole package is client code.

## Key files

| File | Owns |
|---|---|
| `src/index.ts` | Public entry: provider and hooks |
| `tsdown.config.ts` | Build config, adds the `'use client'` banner |
| `vitest.config.ts` | Test setup with jsdom |
| `test/package.test.ts` | Package output checks |

## Commands

```bash
pnpm --filter @ventstd/shamcash-react build
pnpm --filter @ventstd/shamcash-react test
pnpm --filter @ventstd/shamcash-react typecheck
pnpm --filter @ventstd/shamcash-react check:package
```

## Conventions

- Import only types from `@ventstd/shamcash` (`import type`). A value import would pull server code into the browser.
- `'use client'` is a build banner on the entry, not a directive in each file.
- Checkout state lives in `useReducer`. There is no caching library, since checkout does not poll.
- React 19 only. React 18 and the Pages Router are not supported.

## Gotchas

- The leak fixture (`fixtures/client-leak`) proves a value import breaks the build or throws at load. Keep it passing.
- The lint rule that forbids value imports from core arrives with the tooling step.

## Related specs

- [docs/specs/0001-stack-architecture/index.md](../../docs/specs/0001-stack-architecture/index.md)

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
