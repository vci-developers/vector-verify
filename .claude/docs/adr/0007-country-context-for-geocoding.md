---
status: accepted
---

# Country is threaded via a scoped React Context, not props

`country` (resolved from `GET /programs` by `programId`) is needed only inside
the Geographical Summary tab's map subtree, by `MapNavigator`, two hops below
where it's derived. `SiteMap` and `DeviceMap` were forwarding it purely to pass
it along — declaring and threading a prop neither component reads itself.

## Decision

Introduce `CountryProvider`/`useCountry()` at
`geographical-summary/context/country-context.tsx`, mounted once in
`OperationsGeographicalSummary` after its existing `isProgramsPending`/
`isProgramsError` guard, so every consumer inside the provider gets a
guaranteed `string` — never `string | undefined`. `useCountry()` throws if
called outside the provider. This is the first React Context used for shared
app data in this codebase; every other cross-component data need is solved
with plain props or TanStack Query's own cache dedup (each consumer calling
the same `useGet…` hook independently).

## Considered Options

- **Lift `country` to `operations-page-client.tsx` and pass it as a prop
  (rejected).** No precedent anywhere in this codebase for lifting
  single-consumer query data to a shared parent — every existing case
  (`useGetPrograms`, `useGetUserPermissions`, `useGetCollectionCycles`) is
  called locally in whichever component needs it, relying on TanStack Query's
  cache to dedup. Lifting `country` would introduce a new pattern rather than
  follow the established one, for a value only one of four Operations tabs
  uses.
- **Restructure `SiteMap`/`DeviceMap` into children-accepting shells
  (rejected).** React's own docs suggest trying this before Context. Rejected
  here because `country` is the *only* pass-through prop on those components —
  `markers`, `selectedLocations`, and `selectedMarkerId` are genuinely used or
  transformed at that layer, so restructuring around one leftover prop would
  mean rewriting otherwise-correct components to move the problem, not solve
  it.
- **Context with a plausible default value, e.g. `createContext('Uganda')`
  (rejected).** A default masks a missing provider silently — the exact
  failure mode this ADR exists to fix (a hardcoded `'Uganda'` shipped
  undetected). A missing provider must fail loudly in development, not
  degrade to a wrong-but-plausible country.
- **Context typed `string | undefined`, consumers self-gate (rejected).**
  Keeps the provider trivial but re-spreads undefined-handling across every
  consumer — the same fragmentation Context was meant to centralize. Gating
  once at the mount site (behind the existing pending/error guard) means
  every consumer downstream is unconditionally correct.

## Consequences

- `CountryProvider` owns no loading or error state itself — that stays exactly
  where it already lived, in `OperationsGeographicalSummary`'s existing
  `isProgramsPending`/`isProgramsError` handling. The provider only mounts once
  `country` is a real string.
- `SiteMap`, `DeviceMap`, and `GeocodedClusterMap` stop declaring
  `country: string` as a prop they don't use; only `MapNavigator` (and any
  future map-tree consumer) reads it, via `useCountry()`.
- This is a precedent, not a one-off: the next value that is genuinely
  pass-through-only through multiple unrelated layers should be evaluated the
  same way — local single-consumer fetch stays a plain prop or its own hook
  call; only true pass-through-with-no-intermediate-use earns a scoped
  Context. `programId` was evaluated and rejected for this Context (Q6): its
  chain is one hop and both endpoints consume it directly, so it stays a
  prop.
