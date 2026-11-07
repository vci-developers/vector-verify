import { expect, test } from 'vitest';
import { reviewLogActionSchema } from '@/api/review-log/validation/review-log-schema';
import { specimenIdEditLogSchema } from '@/api/review-log/validation/specimen-id-edit-log-schema';
import { getSpecimenIdEditHistory } from '@/features/review/workspace/image/utils/get-specimen-id-edit-history';
import { createReviewLog } from '../../../../../helpers/create-review-log';

const firstEdit = createReviewLog({
    id: 1,
    action: 'update_specimen_thumbnail_prediction',
    fields: { specimenId: 12 },
    changes: { specimenId: { before: 'URJ206', after: 'TEMP' } },
    createdAt: 1000,
});
const latestEdit = createReviewLog({
    id: 2,
    action: 'update_specimen_thumbnail_prediction',
    fields: { specimenId: 12 },
    changes: { specimenId: { before: 'TEMP', after: 'URJ207' } },
    performedBy: { userId: 3, name: 'Last reviewer' },
    createdAt: 2000,
});

test('registers the backend action and validates ID change payloads', () => {
    expect(
        reviewLogActionSchema.parse('update_specimen_thumbnail_prediction'),
    ).toBe('update_specimen_thumbnail_prediction');
    expect(specimenIdEditLogSchema.safeParse(firstEdit).success).toBe(true);
    expect(
        specimenIdEditLogSchema.safeParse({
            ...firstEdit,
            changes: { specimenId: { before: 'URJ206' } },
        }).success,
    ).toBe(false);
});

test('returns the earliest original and latest editor regardless of input order', () => {
    const logs = [latestEdit, firstEdit];
    const history = getSpecimenIdEditHistory(logs, 12);
    expect(history?.originalValue).toBe('URJ206');
    expect(history?.latestEditLog.id).toBe(2);
    expect(history?.latestEditLog.performedBy?.name).toBe('Last reviewer');
    expect(logs.map(log => log.id)).toEqual([2, 1]);
});

test('uses log ID to break equal timestamps deterministically', () => {
    const history = getSpecimenIdEditHistory(
        [{ ...latestEdit, createdAt: 1000 }, firstEdit],
        12,
    );
    expect(history?.originalValue).toBe('URJ206');
    expect(history?.latestEditLog.id).toBe(2);
});

test('retains sticky history when a later edit restores the original ID', () => {
    const reverted = {
        ...latestEdit,
        changes: { specimenId: { before: 'TEMP', after: 'URJ206' } },
    };
    const history = getSpecimenIdEditHistory([firstEdit, reverted], 12);
    expect(history?.originalValue).toBe('URJ206');
    expect(history?.latestEditLog.changes.specimenId.after).toBe('URJ206');
});

test.each([
    { fields: { specimenId: 99 } },
    { fields: { specimenId: '12' } },
    { fields: null },
    { changes: { thumbnailImageId: { before: 1, after: 2 } } },
    { changes: { expectedImages: { before: 1, after: 2 } } },
    { changes: { sessionUnitId: { before: 1, after: 2 } } },
    { changes: { specimenId: null } },
    { changes: { specimenId: { before: null, after: 'URJ207' } } },
    { changes: { specimenId: { before: 'URJ206', after: 207 } } },
    { changes: null },
    { action: 'update_specimen_image_prediction' as const },
])('ignores unrelated or malformed history: %j', overrides => {
    expect(
        getSpecimenIdEditHistory([{ ...firstEdit, ...overrides }], 12),
    ).toBeUndefined();
});

test('accepts numeric top-level identity and prefers it over legacy fields', () => {
    const log = { ...firstEdit, specimenId: 12, fields: { specimenId: 99 } };
    expect(getSpecimenIdEditHistory([log], 12)?.originalValue).toBe('URJ206');
    expect(getSpecimenIdEditHistory([log], 99)).toBeUndefined();
});

test.each([null, { userId: 3, name: null }])(
    'preserves missing editor data for the translated UI fallback',
    performedBy => {
        const history = getSpecimenIdEditHistory(
            [{ ...latestEdit, performedBy }],
            12,
        );
        expect(history?.latestEditLog.performedBy).toEqual(performedBy);
    },
);

test('returns undefined when the specimen has no edits', () => {
    expect(getSpecimenIdEditHistory([], 12)).toBeUndefined();
});
