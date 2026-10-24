# Tests

Use Node 20.19+ within the Node 20 release line, or Node 22.12+.

```sh
yarn test           # Run once
yarn test:watch     # Watch for changes
yarn test:coverage  # Run with coverage reports
```

Tests mirror the relevant paths under `src/`. Use `.test.ts` for utilities and
hooks, and `.test.tsx` when a test contains JSX.

Vitest runs the tests in jsdom. React Testing Library handles component and hook
rendering, and `tests/setup.ts` registers DOM assertions and cleans up after
each test. Production imports use the existing `@/` alias.

Keep fixtures near their tests. Shared helpers belong in `tests/helpers/` only
when multiple tests need them. Each test gets an isolated TanStack Query client
with retries and automatic refetching of cached data disabled.

Coverage reports are written to `coverage/`. No coverage thresholds are enforced
yet.
