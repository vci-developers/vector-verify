# Review is scoped to a single Review Unit — one (Site, Cycle), never a range

The Review workflow certifies data and resolves Metadata Conflicts strictly
within one **Review Unit**: exactly one Sentinel Site paired with exactly one
Collection Cycle (or, for cycle-less programs, one Sentinel Site paired with one
calendar month). The Review date filter only chooses which Cycles/months are
_listed_; it never widens the certifiable/resolvable scope to span multiple
Cycles or months. A VCO can never certify or resolve across more than one Review
Unit in a single action.

## Status

accepted

## Context

`POST /sessions/conflicts/resolve` validates that all targeted sessions (or the
parent sessions of targeted session units) share the same site and Collection
Cycle — falling back to same site + month/year when the sessions have no cycle.
The asynchronous DHIS2 **Sync Task** is likewise keyed by exactly one
`(collectionCycleId, siteId)` pair and submits one site at a time. Certification
is the review decision that precedes that submission, so its scope must line up
with the same boundary the backend enforces downstream. Mixing two Cycles, two
months, or two sites into one certify/resolve action would either be rejected by
the backend or produce data that cannot be cleanly submitted per-site-per-cycle.

## Considered Options

- **One (Site, Cycle) Review Unit (chosen).** Matches the resolve-endpoint
  constraint and the Sync Task key exactly; every certify/resolve call is
  guaranteed valid by construction. The date filter is a _listing_ control only.
  Cost: a VCO reviewing a quarter steps through each Cycle separately — there is
  no "certify everything in view" button, by design.
- **Certify/resolve across the whole selected date range.** Rejected: a range
  can span multiple Cycles/months, which the resolve endpoint rejects and which
  has no valid per-site Sync Task. It also silently invites cross-cycle data
  mixing — the exact class of bug this rebuild exists to remove.

## Consequences

Grouping (sites list), the 3-step workflow, conflict resolution, and
certification all key off the Review Unit. Orphan sessions (cycle-less sessions
in a cycle-using program) form no Review Unit and are therefore not certifiable
until reassigned to a Cycle — handled by a separate unassigned-sessions /
reassignment affordance, not by the main workflow. Any future "bulk" affordance
must fan out into one backend call per Review Unit; it must never widen a single
call's scope.
