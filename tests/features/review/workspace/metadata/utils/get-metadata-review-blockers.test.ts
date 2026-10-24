import { expect, test } from 'vitest';
import { buildMetadataRow } from '@/features/review/workspace/metadata/utils/metadata-section';
import { getMetadataReviewBlockers } from '@/features/review/workspace/metadata/utils/get-metadata-review-blockers';

const field = {
    entity: 'session',
    fieldName: 'collectorName',
    label: 'Collector',
    fieldType: 'text',
} as const;

test('blocks image review when sessions have conflicting metadata', () => {
    const row = buildMetadataRow(
        field,
        new Map([
            [1, 'Alice'],
            [2, 'Bob'],
        ]),
    );
    const result = getMetadataReviewBlockers(
        [{ key: 'session', title: null, rows: [row] }],
        new Map(),
        new Map(),
    );
    expect(result.areAllConflictsResolved).toBe(false);
    expect(result.unresolvedConflictCount).toBe(1);
});

test('allows image review when metadata agrees', () => {
    const row = buildMetadataRow(
        field,
        new Map([
            [1, 'Alice'],
            [2, 'Alice'],
        ]),
    );
    const result = getMetadataReviewBlockers(
        [{ key: 'session', title: null, rows: [row] }],
        new Map(),
        new Map(),
    );
    expect(result.areAllConflictsResolved).toBe(true);
});

test('honors a selected conflict resolution', () => {
    const row = buildMetadataRow(
        field,
        new Map([
            [1, 'Alice'],
            [2, 'Bob'],
        ]),
    );
    const result = getMetadataReviewBlockers(
        [{ key: 'session', title: null, rows: [row] }],
        new Map([[row.id, 'Alice']]),
        new Map(),
    );
    expect(result.areAllConflictsResolved).toBe(true);
});

test('blocks missing required metadata even when values do not conflict', () => {
    const row = buildMetadataRow(
        { ...field, required: true },
        new Map([[1, null]]),
    );
    const result = getMetadataReviewBlockers(
        [{ key: 'session', title: null, rows: [row] }],
        new Map(),
        new Map(),
    );
    expect(result.areAllConflictsResolved).toBe(false);
    expect(result.unmetRequiredRowIds.has(row.id)).toBe(true);
});
