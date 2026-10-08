# shamcash.js

## Stack

Mirrors `docs/specs/0001-stack-architecture/index.md`.

- **Language / Runtime**: TypeScript, strict, shared `tsconfig.base.json`. ESM only, no top level await. Node `>=22.12` floor, also Deno, Bun, and edge runtimes.
- **Framework**: none in core. React 19 in `packages/react`. Next.js 16 in `packages/next` and `examples/next`.
- **Key dependencies**: tsdown 0.23 (bundler, pinned), Vitest `~4.1` with the Cloudflare workers pool, publint and attw (package checks). Core has zero runtime dependencies.
- **Package manager**: pnpm 12.10.1 workspaces. Shared tool versions live in `pnpm-workspace.yaml` under `catalog:`.

## Build approach

Tracer Bullet: build vertical slices. Each endpoint works end to end (crypto, typed core call, Next.js helper, React hook, example app) before the next one starts.

## Commands

```bash
# Install
pnpm install

# Build all published packages
pnpm build

# Typecheck all packages
pnpm typecheck

# Test all packages
pnpm test

# Package output checks (publint and attw)
pnpm check:packages

# Client leak fixture (must fail the way it should)
pnpm check:leak

# Build the example app against the workspace packages
pnpm build:example
```

## Specs

Stored in `docs/specs/`. Format: `docs/specs/NNNN-title.md`. The feature scope lives in `docs/scope/scope.md`.

## Rules

- The secret key stays on the server. Only `packages/core` and `packages/next` may hold it. `packages/react` uses `import type` from core, never a value import.
- Strict TypeScript everywhere. No `any`. Keep the flags in `tsconfig.base.json`.
- SOLID OOP: each class has one job and stays under about 200 lines. Dependencies come in through constructors. No service locator or global registry. Tests inject fakes through constructors, never by patching globals.
- Prefer composition over inheritance. Name classes after what they do (`UserRepository`, not `AbstractBaseUserImpl`).
- Folders are by feature (`bills/`, `refunds/`, `transactions/`), with shared `crypto/` and `http/` folders.
- Named exports only. No default exports.
- Naming: camelCase values, PascalCase types and classes, lowercase file names like `create-bill.ts`, SCREAMING_SNAKE_CASE constants.
- Every exported function, class, and type has a short doc comment. All packages share one ShamCash error family.
- Read env vars once at startup. Fail with a clear message when the secret key is missing or malformed.
- Use string literal unions, not TS `enum`.
- Commits follow Conventional Commits: `type(scope): summary`.

## Tooling

- Lint and format: Biome. Not installed yet, `/develop tooling` sets it up.
- Commit checks: lint, format, and typecheck run before every commit. The hook tool is picked by `/develop tooling`.
- Tests: Vitest unit and integration tests in each package. Core also runs under the workers pool.
- CI: one basic workflow on push that runs lint, typecheck, and test. Not set up yet.

## Git

- integration: on
- branch prefix: feat/
- commit: per-milestone

## Agent skills

Declined: pnpm, tsdown, TypeScript, Vitest, Workers pool, React 19, Next.js 16

## Context files

- [packages/core/AGENTS.md](packages/core/AGENTS.md): server core that holds the secret key
- [packages/react/AGENTS.md](packages/react/AGENTS.md): React hooks for checkout, client only
- [packages/next/AGENTS.md](packages/next/AGENTS.md): Next.js route handler helpers, server only
- [examples/next/AGENTS.md](examples/next/AGENTS.md): private example app that proves each slice

_Drafted by /audit from the repo, worth a quick human pass. Edit freely: once a line stops matching this draft, later runs treat it as curated and will flag rather than overwrite it._
