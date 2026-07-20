# A device is attributed to a single home site (its latest session)

**Context.** Device Activity is derived from sessions. A single `deviceId` can
appear under several `siteId`s (a device is reassigned or its collector roams),
so it is not intrinsically pinned to one site. The headline Active/Lapsing/
Inactive cards already count each device **once**, by its globally-latest
session. The map markers, however, were computed **per site** — each device
re-classified independently at every site it ever touched — so a roaming device
was counted in multiple markers, in different tiers, and the markers did not sum
back to the headline (the Lapsing column was inflated).

**Decision.** Dedup by `deviceId`: every device is counted exactly once, at the
site of its **latest** session, classified by that one status. The per-site
device counts are then just this same set of unique devices grouped by site — so
each tier sums back to its headline card, and all tiers sum to the total.

**Consequences.** A device that historically collected at Site A but whose most
recent session is at Site B shows **only** at B; Site A no longer claims it
(correct — it "went quiet" there). We chose latest-site over most-frequent-site
because it matches the headline's existing "latest session anywhere" rule and
keeps the two numbers definitionally in sync.
