# Adopt nuqs for URL view state

## Status

accepted — revises only the "no new dependency" choice in ADR-0005. The core
decision there (view state in the URL, never browser storage) is unchanged and
not up for review.

## Context

ADR-0005 moved dashboard view state to URL search params, declined nuqs as a
dependency, and adopted it as the reference spec. Implementing the mirror
measured what that costs: ~300 lines of hand-rolled parse/serialize/history code
(`review` and `operations` view-state modules plus `src/lib/view-state/`), and
every design question since — schema placement, module shape, hook API,
omit-at-default behavior — has been resolved by consulting nuqs's docs and then
separately justifying the deviation from our own conventions. Maintaining a
hand-written copy of a library we already treat as normative is the expensive
path.

The behaviors ADR-0005 specified by hand are nuqs v2 defaults: params at their
default are omitted from the URL (`clearOnDefault`), filter changes use
history-replace, updates batch through `useQueryStates`. Compatibility is
verified from the package itself: peer deps `next >= 14.2.0` (we run 16.1.6) and
`react >= 18.2 || ^19` (we run 19.1.1); its only runtime dependency is
`@standard-schema/spec`, a type-only package. ADR-0005's "no server round-trip
per filter change" concern does not apply — nuqs updates are client-side by
default.

## Decision

Add `nuqs` and delete the mirror:

- `NuqsAdapter` wraps the app in the root layout.
- Each feature keeps one hook module colocating its parser definitions with the
  hook (the documented nuqs client-side hook-reuse pattern; the separate
  `searchParams.ts` file is nuqs's server-side pattern and is not needed while
  parsing stays client-side). The month param becomes one custom `createParser`
  reusing the existing parse/format logic.
- `useReviewFilters` / `useOperationsFilters` remain as thin purpose-named
  wrappers whose body is a `useQueryStates` call, so components never see the
  library and the internals stay swappable.
- `replace-url-view-state.ts`, the hand-written parse/serialize functions, and
  their Zod schemas are deleted. The cross-field rule (`startMonth > endMonth` →
  reset both to defaults) cannot live in per-param parsers and stays as a few
  custom lines.

## Considered Options

- **Keep the hand-rolled mirror (status quo).** No new dependency — the one
  remaining argument, and a real one: we are at 47 dependencies and nuqs is
  primarily a single-maintainer project. If this option is chosen instead, the
  settled shape is: one hook file per feature under `hooks/` containing the
  schema, defaults, parse, serialize, and the hook (per the nuqs/TanStack
  colocation pattern), `src/lib/view-state/` for the shared pieces, and an
  ADR-0005 amendment documenting why these schemas don't live in `validation/`.

## Consequences

- Future view-state behavior questions are answered by the library instead of
  re-derived and re-documented per feature.
- The `validation/` folder convention keeps governing trust-boundary contracts
  (backend responses, request bodies, BFF query params, forms); URL param
  definitions are parser config, not Zod contracts, so the schema-placement
  question dissolves.
- Switching is cheapest now, before components wire into the hooks (~a day);
  after wiring, the thin-wrapper seam keeps a later swap component-invisible but
  the branch would be rewritten twice.
