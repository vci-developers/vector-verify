---
status: accepted
---

# Device Activity is keyed to Collection Cycles, superseding rolling calendar months

The Operations device map originally measured activity over **rolling calendar
months** and exposed three tiers — Active / Lapsing / Inactive — deliberately
**not** consulting Collection Cycles so the same model applied to every program
(see ADR 0002, which this partially supersedes). We now key Device Activity to
**Collection Cycles** and collapse to **two** states, Active vs Inactive.

The foundation of ADR 0002 is unchanged: activity is still derived from
`/sessions/` grouped by `deviceId` and scoped by the sessions' `siteId`s — the
device registry (`GET /devices/`) is still rejected as a source because it has
no location. Only the time model (months → cycles) and the tiering (three →
two) are reversed here.

**Current cycle** = the Collection Cycle whose window contains today
(`startDate <= now < endDate`), falling back to the most recent cycle that has
already started when today lands in a gap or past the last cycle. A device is
**Active** if it has ≥1 session in the current cycle, **Inactive** if it is in
the universe but has no session in the current cycle. Cycle membership is read
from the backend-assigned `session.collectionCycleId` (id equality) — never
recomputed on the frontend.

## Considered Options

- **Keep rolling calendar months (rejected).** Consistent across all programs
  and needs no cycles fetch, but it does not line up with how Review and DHIS2
  Submission already group work (by Collection Cycle). "Active this month" and
  "certified this cycle" drift apart, so the map answered a different question
  than the rest of Operations.
- **Cycles only, no fallback (rejected).** Cleanest model, but programs without
  a Collection Schedule have no cycles at all, so the device map would break for
  every legacy program until adoption is universal.
- **Cycles with a temporary calendar-month fallback (chosen).** Programs with
  cycles use the current cycle + 2 previous cycles as the universe; programs with
  no Collection Schedule fall back to current month + 2 previous months, mirroring
  `buildReviewSegments` (`collectionCycles.length > 0 ? cycles : months`). The
  fallback is explicitly temporary and to be removed once all programs have
  cycles.

## Consequences

- **Cycle-aligned with the rest of Operations.** "Active" now means the same
  window Review and Submission operate over, so the map reconciles conceptually
  with certification and DHIS2 sync.
- **Lapsing no longer exists.** The middle tier is gone; the marker color ladder
  collapses to binary (green if the marker has ≥1 active device, else grey), and
  the headline cards, legend, and info-panel row drop the Lapsing line.
- **Bounded 3-cycle universe.** The universe = unique devices with ≥1 session in
  the current + 2 previous cycles. This keeps "Inactive" meaningful ("recently
  operated here, silent this cycle" rather than "churned out years ago") and keeps
  the fetch bounded. It is the only defensible denominator, since the device
  schema carries no per-site roster of "expected" devices.
- **No frontend cycle date-math.** Membership is read from `collectionCycleId`, so
  there is no boundary-day timezone bug from re-deriving which cycle a session
  falls in. The only instant comparison we perform is selecting the current cycle
  (`startDate <= now < endDate`), which is epoch-vs-epoch and timezone-independent.
  A future change that recomputes membership from `collectionDate` + cycle windows
  would reintroduce that bug and must be avoided.
- **Map and info panel share one marker array; all markers are drawn.** Active
  markers render green and sized by active-device count; all-inactive areas render
  as small grey dots (active count 0 → minimum radius). Because both surfaces read
  the same array, the panel is a complete ledger and both tiers sum back to their
  headline cards.
- **Pagination still required (carried forward from ADR 0002).** The 3-cycle fetch
  must still paginate `/sessions/` (page-limited to 100) or device counts
  undercount; `getAllSessions` already does this.
