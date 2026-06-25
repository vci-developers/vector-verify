# DHIS2 Sync Frontend Notes

The DHIS2 sync endpoint supports two flows:

- `dryRun=true`: validate and preview the payload immediately. This does not
  create a sync task and does not write a task row to the database.
- Normal sync: create a background sync task, return a task id immediately, and
  poll for status/result.

## Start A Sync

Use:

```http
POST /dhis2/sync
```

Preferred request shape:

```http
POST /dhis2/sync?collectionCycleId=123&siteId=456
```

`collectionCycleId` and `siteId` must be provided together. The backend stores
both values on the task so the frontend can later look up recent sync status for
the same cycle/site pair.

Legacy monthly sync is still supported:

```http
POST /dhis2/sync?year=2026&month=6&district=Example%20District
POST /dhis2/sync?year=2026&month=6&district=Example%20District&siteIds=1,2,3
```

Optional body for both modes:

```json
{
    "irsData": [
        {
            "siteId": 456,
            "wasIrsSprayed": true,
            "insecticideSprayed": "Example",
            "dateLastSprayed": "2026-06-01"
        }
    ]
}
```

> **VectorVerify client conventions** (Step 7+, see
> `validation/post-dhis2-sync-task-schema.ts`): although the API marks the body
> optional, our `postDhis2SyncTask` server fn + `usePostDhis2SyncTask` hook take
> a **required** `requestBody` (the BFF route uses `request.json()`, which 400s
> on an empty body); the Zod `irsData` field itself stays optional. And
> `insecticideSprayed` — a free `string` on the wire — is **narrowed to a
> 9-value enum** (`irsInsecticideSchema`) submitted verbatim to DHIS2; the
> values are exact-match (`Alpha Cyhalothrin(Fendona)` has no space). Memories:
> `project_post_dhis2_sync_body_required`, `project_irs_insecticide_enum`.

## Normal Sync Response

Normal sync returns `202 Accepted`:

```json
{
    "success": true,
    "taskId": "550e8400-e29b-41d4-a716-446655440000",
    "collectionCycleId": 123,
    "siteId": 456,
    "status": "pending",
    "timeoutSeconds": 300
}
```

Task statuses are:

- `pending`
- `running`
- `completed`
- `failed`
- `timed_out`

The backend times out background sync work after 300 seconds.

## Poll Sync Status

Poll by task id:

```http
GET /dhis2/sync/550e8400-e29b-41d4-a716-446655440000
```

Or look up recent tasks by cycle/site:

```http
GET /dhis2/sync?collectionCycleId=123&siteId=456
```

The response always returns `tasks`, even when polling by a single task id:

```json
{
    "success": true,
    "tasks": [
        {
            "id": "550e8400-e29b-41d4-a716-446655440000",
            "status": "completed",
            "year": 2026,
            "month": 6,
            "district": "Example District",
            "siteIds": [456],
            "collectionCycleId": 123,
            "siteId": 456,
            "dryRun": false,
            "timeoutSeconds": 300,
            "startedAt": "2026-06-04T10:00:00.000Z",
            "finishedAt": "2026-06-04T10:00:05.000Z",
            "error": null,
            "result": {
                "success": true,
                "summary": {
                    "totalHouseholds": 1,
                    "successfulSyncs": 1,
                    "failedSyncs": 0,
                    "skippedHouseholds": 0
                },
                "results": []
            },
            "createdAt": "2026-06-04T10:00:00.000Z",
            "updatedAt": "2026-06-04T10:00:05.000Z"
        }
    ]
}
```

If multiple tasks exist for the same `collectionCycleId` and `siteId`, they are
returned newest first.

## Dry Run

Use `dryRun=true` to validate and preview without creating a background task:

```http
POST /dhis2/sync?collectionCycleId=123&siteId=456&dryRun=true
```

Dry run returns `200 OK` with the sync validation result directly:

```json
{
    "success": true,
    "year": 2026,
    "month": 6,
    "dryRun": true,
    "summary": {
        "totalHouseholds": 1,
        "successfulSyncs": 1,
        "failedSyncs": 0,
        "skippedHouseholds": 0
    },
    "results": []
}
```

Because dry runs do not create task records, do not poll for dry-run status.

## Retry Behavior

There is no retry endpoint. If a task is `failed` or `timed_out`, start a new
normal sync with the same `collectionCycleId` and `siteId`. The frontend can
then use the cycle/site polling endpoint to show both the old failed task and
the new task.
