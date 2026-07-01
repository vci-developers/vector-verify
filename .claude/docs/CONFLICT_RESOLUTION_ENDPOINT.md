# Conflict Resolution Endpoint

`POST /sessions/conflicts/resolve`

Resolves conflicting session data by applying one selected set of values to
every target in the conflict group. The request must target either sessions or
session units, not both.

## Session Conflicts

Use `sessionIds` when resolving conflicts between sessions. All sessions must
exist and belong to the same site and the same Collection Cycle. For sessions
with no Collection Cycle (`collectionCycleId` null), the backend falls back to
requiring the same calendar month and year. This pairing — `(site, cycle)`, or
`(site, month)` when cycle-less — is the **Review Unit** (see
`.claude/CONTEXT.md`); a single resolve call must never span more than one
Review Unit.

Session mode can update:

- Core session fields through `resolvedData`
- Legacy surveillance form fields through `resolvedSurveillanceForm`
- Session-scoped dynamic form answers through `resolvedFormAnswers`

Dynamic form questions in this mode must have `answerScope: "SESSION"`.

```json
{
    "sessionIds": [101, 102],
    "resolvedData": {
        "collectorName": "Amina Okello",
        "collectionDate": 1717200000000,
        "state": "CERTIFIED"
    },
    "resolvedFormAnswers": [
        {
            "questionId": 12,
            "value": "Indoor collection",
            "dataType": "text"
        }
    ]
}
```

## Session Unit Conflicts

Use `sessionUnitIds` when resolving conflicts between repeated collection units
within sessions. All units must exist, and their parent sessions must belong to
the same Review Unit — the same site and Collection Cycle (or same site and
month/year when the sessions have no cycle).

Unit mode only updates dynamic form answers. `resolvedData` and
`resolvedSurveillanceForm` are rejected in this mode.

Dynamic form questions in this mode must have `answerScope: "SESSION_UNIT"`.

```json
{
    "sessionUnitIds": [501, 502],
    "resolvedFormAnswers": [
        {
            "questionId": 34,
            "value": "Bedroom",
            "dataType": "text"
        }
    ]
}
```

## Validation Rules

- Provide exactly one of `sessionIds` or `sessionUnitIds`.
- Provide at least two IDs for the selected target type.
- Dynamic form answers must belong to published forms for the target site
  program.
- All dynamic answers in one request must belong to the same form.
- `sessionIds` require `SESSION` scoped questions.
- `sessionUnitIds` require `SESSION_UNIT` scoped questions.

## Response

```json
{
    "message": "Conflict resolved successfully",
    "resolutionId": 77,
    "updatedSessionCount": 2,
    "updatedSessionUnitCount": 0
}
```

For session unit resolutions, `updatedSessionUnitCount` is the number of units
updated. The endpoint also writes a conflict resolution record and review action
log with before/after data.
