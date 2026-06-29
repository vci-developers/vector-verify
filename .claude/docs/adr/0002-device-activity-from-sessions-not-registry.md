---
status: accepted
---

# Device Activity is derived from sessions, not the device registry

The Operations geographical map shows Active / Lapsing / Inactive **device**
counts, scoped to the selected location like Unique Sites. The obvious data
source is the device registry (`GET /devices/`), but we deliberately do **not**
use it: the registry is program-scoped and carries no location, so it cannot be
filtered to the selected district/site and its counts would not reconcile with a
location-scoped Active count. Instead we derive everything from `/sessions/`
grouped by `deviceId` and scoped by the sessions' `siteId`s — a device "belongs"
to a location only through the sessions it produced there.

## Considered Options

- **`GET /devices/` registry (rejected).** Simple universe of all program
  devices, and the only way to count devices that registered but never
  submitted. Rejected because it has no location: Active/Lapsing could be scoped
  to the selected location but Inactive could not, so the three tiers would not
  sum to a single coherent universe, and the cards would ignore the location
  selector.
- **Session-derived, location-scoped universe (chosen).** A location's device
  universe = devices with ≥1 session at a site in the selected location over the
  last **6 calendar months**. Active = submitted there in the current month;
  Lapsing = within the last 3 months but not the current month; Inactive = in
  the 6-month universe but silent for the last 3 months. All three reconcile and
  all respond to the location selector.

## Consequences

- "Inactive" means "used to collect in this location but went quiet", not
  "registered but never used". Devices that never submitted in the location, or
  whose last session predates the 6-month window, are simply absent — there is
  no global registered-device denominator.
- Activity is evaluated **as-of-today** over rolling calendar months (Active =
  current month; Lapsing = within the last 3 months, not the current; Inactive =
  in the 6-month universe but silent the last 3 months), independent of the
  page's month filter.
- Collection cycles are intentionally **not** consulted: the same rolling-month
  model applies to every program, so the device view is consistent whether or
  not a program has a Collection Schedule, and the feature needs no
  collection-cycles fetch.
- The 6-month fetch must paginate `/sessions/` (page-limited to 100) or device
  counts will undercount; the existing `getAllSessions` server function already
  does this.
