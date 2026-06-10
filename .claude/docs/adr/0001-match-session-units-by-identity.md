---
status: accepted
---

# Match Session Units by identity, not `unitOrder`

During Review, conflict detection must decide which Session Units from different
sessions are "the same unit." We match by **identity** — the combination of all
`isUnitIdentityComponent` answers, normalized (trimmed, lowercased) and joined,
sorted by question id — mirroring the API's own unit-identity rule. We do
**not** match by `unitOrder`, even though it is the obvious positional field.

## Why

`unitOrder` only matches correctly if every VHT records units in the same
sequence. When two VHTs record the same rooms in a different order,
`unitOrder`-matching pairs the wrong units and manufactures false conflicts on
every field. Identity-matching pairs units by what they actually are, so order
is irrelevant and only genuine "same unit, different value" disagreements
surface. It also makes the identity component itself a non-conflict by
construction (it is the match key) — the behaviour the API and the team already
assumed.

The API backs this: identity questions are forced `required` (identity is always
present) and identities are validated unique within a Session
(`validateUniqueUnitsWithinSession` in `vectorcam-api`), so matching is
unambiguous without client-side fallbacks.

## Considered Options

- **`unitOrder`** (rejected) — simple, but produces false conflicts whenever
  recording order differs across sessions, and lets the identity value itself
  appear as a resolvable conflict.
- **Identity** (chosen) — robust to ordering, no false conflicts, identity is
  never resolvable.

## Consequences

- The client must compute the identity key exactly as the API does (all identity
  components, same normalization). If the API changes its identity rule, the
  client must change in lockstep.
- A unit whose identity exists in one session but not another surfaces as a
  conflict (the missing session's cell reads empty / `N/A`) and **blocks**
  continuing. It cannot be resolved within the current contract — the resolve
  endpoint requires `sessionUnitIds` of at least two and cannot create units — so
  the VCO stays blocked until a backend capability to add/remove units exists.
  The block is enforced at the gate (any unit missing from a session disables
  "Resolve & Continue"); such a unit is never sent in a resolve request.
