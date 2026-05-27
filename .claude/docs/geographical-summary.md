# Geographical Summary — Implementation Notes

_Created: Apr 16, 2026_

## Data Sources and Why

### Specimens (`/api/specimens/count`)

Village information — name, parish, sub-county, district — comes exclusively
from the specimens count endpoint via `siteInfo`. The `siteInfo` field is
populated via a `JOIN` on the `sites` table and is the only reliable source of
village names associated with the user's program.

Sessions (`/api/sessions/all`) do **not** carry village-level location
information (`formatSessionResponse` in the backend never includes the `site`
field), so they cannot be used as the primary data source for geographic
grouping.

### Sessions (`/api/sessions/all`)

Sessions are fetched solely to calculate `sessionCount` and `lastCollectionDate`
per village. These are joined to the specimen data via `siteId → villageName`
mapping built during aggregation.

---

## Why Group By Village Name (Not `siteId`)

**Lead dev direction:** a single village may have multiple sites (houses) within
it. Grouping by `siteId` would produce one marker per house, which is too
granular and clutters the map. Grouping by `villageName` aggregates all specimen
counts and sessions for an entire village into one marker.

The tradeoff: if two sites in different locations happen to share the same
village name, their data merges. This is acceptable for district-level
surveillance overview.

---

## Why There Is No GPS Positioning

Session records include GPS coordinates, but these reflect **where the session
was submitted** (the field worker's phone location at upload time), not the
actual collection site. During development, GPS data for Ugandan sessions was
observed to show Baltimore, India, and Philadelphia. GPS coordinates are
therefore completely unusable for map positioning.

All marker positioning is done via **Nominatim geocoding** using the village
name and location hierarchy.

---

## Geocoding Architecture

### Why Server-Side (`/api/geocode/route.ts`)

Nominatim's usage policy requires:

- A valid `User-Agent` header identifying the application
- Maximum 1 request per second per IP

Calling Nominatim directly from the browser causes:

- CORS errors when Nominatim returns 429 (rate limited) without CORS headers on
  the error response — Chrome/Firefox report this as "CORS Missing Allow Origin"
  even though it is actually a rate limit response
- Every user's browser hitting Nominatim independently, multiplying the rate
  limit pressure

The `/api/geocode` route proxies all Nominatim requests from the server,
enforces a 1100ms minimum interval between outgoing requests, and caches results
in memory for 30 days.

### Fallback Hierarchy (Server-Side)

The client sends one request per village with the raw location fields:
`?village=&parish=&subCounty=&district=`. The server builds and tries the
following query chain internally until one resolves:

1. `{villageName}, {parish} Parish, {district} District, Uganda`
2. `{villageName}, {district} District, Uganda`
3. `{parish} Parish, {district} District, Uganda`
4. `{subCounty}, {district} District, Uganda`
5. `{district} District, Uganda`

This means the client makes **one HTTP call per village** rather than up to
five. The server handles all fallbacks and only returns when one resolves (or
all fail).

The final fallback (district only) ensures markers always appear somewhere on
the map, even for villages with unusual names that Nominatim cannot resolve
directly (e.g. `"Guluguru + Aiywala"`, `"Ofua Subcounty"`).

### Client-Side Cache (`use-village-geocode.ts`)

A module-level `Map<string, GeocodedPosition>` caches resolved positions by
village name for the duration of the browser session. This avoids redundant
calls to `/api/geocode` when the user changes the date range but the same
villages are returned.

---

## Program Isolation

The backend enforces program isolation via `siteAccess.userSites` populated in
the JWT middleware — users only receive data for sites they have been granted
access to. The `programId` query parameter on `GET /specimens/count` is
**ignored by the backend entirely** (`QueryParams` in `getCount.ts` has no
`programId` field). Sending `programId` on the request has no effect and it has
been removed from the frontend query and Zod schema.

---

## CSS Imports and TypeScript

`site-map.tsx` imports three CSS files directly:

```ts
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
```

These are Leaflet's own styles (map controls, tile layer chrome, cluster bubble
rendering). Tailwind does not replace them — they are unrelated to the project's
own styling. Without them, the map renders broken.

TypeScript has no type information for `.css` files. Next.js ships declarations
for `*.module.css` (CSS Modules) in `next-env.d.ts` but not for plain
side-effect imports. `src/types/global.d.ts` adds `declare module '*.css'` to
silence the `Cannot find module` error for these imports. `src/types/` is
registered as a `shared` element in `eslint.config.mjs` so the boundaries plugin
recognises it.

---

## Schema Fixes

### `specimensCountSchema` — nullable species/sex/abdomenStatus

The backend joins `specimen_images` via a `LEFT JOIN`. When a specimen has not
yet had an image recorded, the join returns `null` for `species`, `sex`, and
`abdomenStatus`. The frontend Zod schema originally had `z.string()` for these
fields, causing response validation to silently fail (returning
`{ ok: false, error: { kind: 'client' } }` with status 400) whenever the result
set contained unclassified specimens.

Fix: changed to `z.string().nullable()` on all three fields. The aggregation in
`use-site-markers.ts` skips counts with null species when building the species
breakdown.

### `siteSchema` — nullable location fields

The backend marks `district`, `subCounty`, `parish`, `villageName`,
`healthCenter`, `name`, and `locationTypeId` as `nullable: true` in its Swagger
schema. The frontend `siteSchema` previously used `.optional()` (which accepts
`undefined` but not `null`), causing Zod validation failures when the backend
explicitly returned `null` for these fields.

Fix: changed all nullable location fields to `.nullable().optional()`.
`locationHierarchy` uses `.optional().default({})` since it is always an object
when present.

---

## Key Functions

### `aggregateByVillage(data)` — `use-site-markers.ts`

Groups specimen count entries by `siteInfo.villageName`. Builds two outputs:

- `villageData` — a `Map<villageName, VillageData>` with accumulated specimen
  and Anopheles counts plus species breakdowns
- `siteIdToVillage` — a `Map<siteId, villageName>` used to join session data

Sites without a `villageName` are skipped entirely.

### `sessionStatsByVillage(sessions, siteIdToVillage)` — `use-site-markers.ts`

Iterates sessions and uses `siteIdToVillage` to count sessions and find the most
recent `collectionDate` per village.

### `buildMarkers(villageData, sessionStats)` — `use-site-markers.ts`

Combines the two maps into the final `VillageMarker[]` array. Species breakdown
is sorted descending by count and capped at 5 entries for tooltip display.

### `totalVillages` — `useSiteMarkers` return value

Counts only markers with `sessionCount > 0`. Specimens data includes all sites
in the user's program regardless of whether they have sessions in the selected
date range (the backend pre-populates all accessible sites), so filtering by
`sessionCount > 0` gives the number of villages that were actually visited.

### `useVillageGeocode(markers)` — `use-village-geocode.ts`

Runs a sequential geocoding loop (one village at a time) to avoid concurrently
overloading the server-side rate limiter. Keyed by a stable string derived from
sorted village IDs — the loop only restarts when the set of villages actually
changes, not on every parent re-render.

### `MapNavigator` — `map-navigator.tsx`

A render-null React Leaflet component that lives inside `MapContainer`. When
geocoded `bounds` are available it calls `flyToBounds` to frame all markers.
Before bounds are available (geocoding still in progress), it geocodes the
district name as a fallback to set an appropriate initial map view.

### `createSiteIcon(totalSpecimens, anophelesCount)` — `site-icon.tsx`

Creates a Leaflet `DivIcon` (circular div). Radius scales from 8–26px based on
specimen count (`min + count / 20`, clamped). Color encodes Anopheles count
across five thresholds: gray (0), blue (1–9), orange (10–49), red (50–99), dark
red (100+).

---

## Type Boundary

`VillageMarker` is defined in `src/features/operations/lib/use-site-markers.ts`
(alongside the hook that produces markers) and imported from there by all
consumers. It was previously defined in `site-map.tsx` (a component file), which
caused `lib/` code to depend on a component — a boundary violation per the
project architecture. `site-map.tsx` re-exports the type for any consumers that
still reference it via that path.

---

## Marker Clustering

`react-leaflet-cluster` wraps `leaflet.markercluster` to group nearby markers
into cluster bubbles. This prevents markers from overlapping when multiple
villages geocode to the same or nearby coordinates (e.g. when village names are
non-standard and fall back to parish or district level).

The `key={positions.size}` on `MarkerClusterGroup` forces the component to
remount when the geocoded positions Map first becomes populated. Without this,
`react-leaflet-cluster` does not pick up children that were added after its
initial render.

---

## PR Description

This pull request implements the Geographical Summary tab within the Operations
page, displaying village-level markers for a selected district and date range.

**Map & Geocoding (`src/features/operations/components/geographical-summary/`)**

- Added `site-map.tsx`, `MarkerLayer`, and `MapNavigator` to render a Leaflet
  map with markers sized by specimen count and colored by Anopheles count.
  Marker icon creation (`L.divIcon`) lives inside `MarkerLayer` to keep the
  direct Leaflet import within the `ssr: false` boundary. Nearby markers are
  clustered using `react-leaflet-cluster` to prevent overlap.
- Added `hooks/use-village-geocode.ts` and `src/app/api/geocode/route.ts` — a
  server-side Nominatim proxy with rate limiting (1100ms), proper `User-Agent`
  headers, and 30-day in-memory caching. The client sends one request per
  village; the server handles the location fallback hierarchy (village → parish
  → sub-county → district) internally.

**Data Layer (`src/features/operations/lib/use-site-markers.ts`)**

- Added `useSiteMarkers` hook aggregating specimens and sessions into
  `VillageMarker[]` grouped by village name. Sessions are joined via a
  `siteId → villageName` map to add session count and last collection date per
  village.

**Schema Fixes**

- Marked `species`, `sex`, and `abdomenStatus` as `.nullable()` in
  `get-specimens-count-schema.ts` — the backend uses a
  `LEFT JOIN specimen_images`, so unclassified specimens return `null` for these
  fields.
- Updated `siteSchema` location fields to `.nullable().optional()` to match the
  backend, which explicitly returns `null` for unpopulated fields rather than
  omitting them.
- Removed `programId` from `getSpecimensCountQueryParamsSchema` — the backend
  ignores it entirely, with program isolation handled server-side via
  `siteAccess.userSites`.
