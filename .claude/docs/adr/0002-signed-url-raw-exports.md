# 2. Signed-URL Raw Data Exports (direct backend download)

Date: 2026-06-24

## Status

Accepted

> **Update (2026-07-21):** The backend endpoint was renamed
> `POST /export/sign` → `POST /resources/sign`. The decision recorded here is
> unchanged; the original endpoint references below are preserved as-written for
> the historical record.

## Context

Each **Raw Data Export** (Specimens, Surveillance Forms, Annotations) was served
by proxying the whole CSV through VectorVerify: the browser hit a BFF route, the
BFF called the backend export endpoint with the bearer token, and the entire
response body was piped back out. The full file transfer — and its memory cost —
sat on the Next.js server for data that is already the developer's own program
data, served by the backend.

The backend shipped `POST /export/sign` (singular `export`): given an export (or
report) path, it returns `{ url, expiresAt }` — a short-lived, pre-signed URL
granting **temporary unauthenticated access** to that path, served directly by
the backend. This is `devMode`-gated developer tooling; the audience is
engineers who want the raw dump, and often want the URL itself (curl, scripts,
notebooks).

## Decision

Replace the raw-export proxy with a Signed Export URL flow.

1. **Sign, don't proxy.** VectorVerify calls `POST /export/sign` through the
   standard authenticated BFF trio (request schema `{ path }`, response schema
   `{ url, expiresAt }`, server function, `usePost…` mutation hook, BFF route).
   That is the _only_ part that flows through our server.
2. **Download direct from the backend.** The returned signed URL is opened as a
   plain cross-origin anchor navigation; the backend's `Content-Disposition`
   triggers the save and owns the filename. The heavy CSV transfer goes browser
   ↔ backend, never through Next.js. The existing fetch-and-blob download helper
   is deliberately **not** reused (it would hit CORS and load the whole file
   into memory); it stays in use only by the Report Export.
3. **Path is built client-side from fixed params.** Each export path is
   assembled inline from `programId` plus the existing fixed params (Specimens
   carries `sessionType=SURVEILLANCE` & `includeInferenceResult=true`). No path
   allowlist is enforced on our side — the backend authorizes and signs.
4. **Expiry is surfaced, not hidden.** Each export row shows a live countdown
   derived from `expiresAt`; on expiry the link is removed (so a dead URL can
   never be clicked into a raw backend error page) and the developer can
   regenerate a fresh one.
5. **Remove the proxy.** The three raw-export BFF routes, the three proxy server
   functions, and the three query-param schemas are deleted. The backend export
   endpoints are retained — they are the signed-URL targets.

## Consequences

**Positive**

- Large CSV transfers no longer load or buffer through the VectorVerify server.
- The developer gets an inspectable, reusable URL, which fits the `devMode`
  audience better than an invisible auto-download.
- Net code reduction: a single sign trio replaces three proxy trios.

**Negative / risks**

- **Intentional deviation from "client components never call backend APIs
  directly."** The signed-URL download has the browser fetch straight from the
  backend host, bypassing the BFF. This is the surprising part and the reason
  this ADR exists — it is scoped to the signed download only; all authenticated
  traffic still goes through the BFF.
- **Unauthenticated, time-limited URLs.** Access control on the download shifts
  to the signature + `expiresAt` window. A leaked URL is usable until it
  expires.
- **The download itself is uncatchable.** Once the browser navigates to the
  signed URL, failures (expired/`503`) render outside React. Mitigated by
  removing the link at expiry so the common stale-click case can't happen.
- **`expiresAt` units unconfirmed** (epoch seconds vs milliseconds). Isolated in
  the pure expiry helper so resolving it is a one-line change.
- **Filename ownership moved to the backend.** The cross-origin `download`
  attribute is ignored by browsers, so the client can no longer name the file;
  it relies on the backend `Content-Disposition`.

## Alternatives considered

- **One-click auto-navigate (sign then immediately download, no visible link)**
  — rejected for this feature: it hides the URL, which is exactly what a
  developer audience wants to grab and reuse. The visible-link-with-countdown
  design was chosen deliberately.
- **Keep proxying but stream more efficiently** — does not remove the structural
  cost (transfer still traverses our server) and forgoes the reusable URL.
- **Migrate Report Export to signing in the same change** — deferred; the
  endpoint supports report paths, but Report Export keeps its proxied flow for
  now (it serves health officers, not the `devMode` audience, and downloads a
  single scoped `.xlsx`).
