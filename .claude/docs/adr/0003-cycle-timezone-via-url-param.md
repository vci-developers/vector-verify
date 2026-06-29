# Carry the Collection Cycle timezone through the review URL

The review detail page (`/review/[siteId]`) needs a Collection Cycle's
**Timezone** to render Session `collectionDate`s in the region where collection
happened. We carry it as a `timezone` query param on the link built in
`review-site-leaf-rows.tsx`, read it in `page.tsx`, and pass it down as a prop —
the same channel already used for `startDate`, `endDate`, `collectionCycleId`,
and `displayName`. We do **not** re-fetch cycles to resolve it.

## Status

accepted

## Context

A review workspace is scoped to one Site + one Cycle (or one month), so exactly
one timezone is ever in play — see the **Timezone** entry in CONTEXT.md. The
value is already loaded on the cycle object (`cycle.timezone`) at link-build
time. Timezone is **display-only**: cycle membership is a backend instant
comparison and is timezone-independent, so the worst failure mode here is a date
_rendered_ off by a day, never a Session bucketed into the wrong Cycle.

## Considered Options

- **URL param (chosen).** Zero extra fetch; identical to how all other
  detail-page context already flows. The cycle's denormalized timezone is fixed
  at generation and never changes, so the snapshot can't go stale. Weakness: a
  hand-edited or stripped URL omits the param and falls back to UTC display —
  already the documented behavior for a null timezone.
- **Re-fetch all cycles client-side + `Map<cycleId, timezone>` (the prior
  approach).** Rejected: a redundant network round-trip on every workspace, and
  the Map models a multiplicity of timezones that cannot occur (one per
  workspace). The backend has no get-single-cycle endpoint, so resolving from
  the id alone forces a full-list fetch.
- **Derive server-side in `page.tsx`, pass as prop.** Rejected: reintroduces the
  list fetch (now needing `programId` server-side) to guarantee "freshness" of a
  value that never changes and is already in hand at link-build time.

## Consequences

The timezone is available to all three review workspaces (metadata, image,
certification) as one prop without any of them fetching cycles. Anyone building
a link into the review detail page must include the `timezone` param; omitting
it degrades to UTC display, not an error.
