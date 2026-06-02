# Track initial Prediction Conflict state in local session state

During Image Review, a Specimen's Prediction Conflict status is derived live
from its `images[]` predictions. Once label correction ships, a VCO can change
predictions — resolving the conflict — but at that point the data no longer
carries any record that a conflict ever existed. To preserve the `TriangleAlert`
→ `CircleCheck` transition in the image selector row, we initialize a
`hadConflictSpecimenIds: Set<number>` in local state when specimens are first
loaded, recording which specimens had a Prediction Conflict at load time. The
conflict indicator then distinguishes three states: currently conflicted
(TriangleAlert), was conflicted + now resolved (CircleCheck), and never
conflicted (no icon).

The alternative — deriving everything from live data — would make "resolved" and
"never conflicted" look identical, losing the visual feedback that the VCO's
correction had an effect.
