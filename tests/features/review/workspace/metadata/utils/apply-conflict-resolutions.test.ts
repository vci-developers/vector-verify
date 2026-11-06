import { expect, test } from 'vitest';
import { applyConflictResolutions } from '@/features/review/workspace/metadata/utils/apply-conflict-resolutions';
import {
    buildMetadataRow,
    formatDisplayValue,
} from '@/features/review/workspace/metadata/utils/metadata-section';

const multiSelectField = {
    entity: 'formAnswer',
    fieldName: '10',
    label: 'Collection locations',
    fieldType: 'multi-select',
} as const;

test('treats the same options in a different order as no conflict', () => {
    const metadataRow = buildMetadataRow(
        multiSelectField,
        new Map([
            [1, ['Outdoors', 'Indoors']],
            [2, ['Indoors', 'Outdoors']],
        ]),
    );
    expect(metadataRow.hasConflict).toBe(false);
});

test('shows an empty multi-select answer as not applicable', () => {
    expect(formatDisplayValue([])).toBe('N/A');
});

test('saves an untouched multi-select answer as a list', () => {
    const metadataRow = buildMetadataRow(
        multiSelectField,
        new Map([[1, ['Indoors', 'Outdoors']]]),
    );
    const { resolvedFormAnswers } = applyConflictResolutions(
        [metadataRow],
        new Map(),
        new Set(),
    );
    expect(resolvedFormAnswers).toEqual([
        {
            questionId: 10,
            value: ['Indoors', 'Outdoors'],
            dataType: 'multi-select',
        },
    ]);
});

test('keeps an option containing a comma as one value', () => {
    const metadataRow = buildMetadataRow(
        multiSelectField,
        new Map([[1, ['Sheep']]]),
    );
    const { resolvedFormAnswers } = applyConflictResolutions(
        [metadataRow],
        new Map([[metadataRow.id, ['Cattle, Goats', 'Sheep']]]),
        new Set(),
    );
    expect(resolvedFormAnswers[0]?.value).toEqual(['Cattle, Goats', 'Sheep']);
});

test('clears a multi-select answer when no options remain', () => {
    const metadataRow = buildMetadataRow(
        multiSelectField,
        new Map([[1, ['Sheep']]]),
    );
    const { resolvedFormAnswers } = applyConflictResolutions(
        [metadataRow],
        new Map([[metadataRow.id, 'N/A']]),
        new Set(),
    );
    expect(resolvedFormAnswers[0]?.value).toBeNull();
});
