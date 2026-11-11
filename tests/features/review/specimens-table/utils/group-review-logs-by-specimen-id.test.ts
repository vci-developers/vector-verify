import { expect, test } from 'vitest';
import { groupReviewLogsBySpecimenId } from '@/features/review/specimens-table/utils/group-review-logs-by-specimen-id';
import { createReviewLog } from '../../../../helpers/create-review-log';

test('groups numeric specimen IDs and preserves input order within each group', () => {
    const logs = [
        createReviewLog({ id: 3, specimenId: 7 }),
        createReviewLog({ id: 1, specimenId: 8 }),
        createReviewLog({ id: 2, specimenId: 7 }),
    ];
    const groups = groupReviewLogsBySpecimenId(logs);
    expect([...groups.keys()]).toEqual([7, 8]);
    expect(groups.get(7)).toEqual([logs[0], logs[2]]);
    expect(groups.get(8)).toEqual([logs[1]]);
});

test('prefers the top-level ID over a conflicting nested ID', () => {
    const log = createReviewLog({ specimenId: 8, fields: { specimenId: 7 } });
    const groups = groupReviewLogsBySpecimenId([log]);
    expect(groups.get(8)).toEqual([log]);
    expect(groups.has(7)).toBe(false);
});

test.each([null, undefined])(
    'uses the nested numeric ID when the top-level ID is %s',
    specimenId => {
        const log = createReviewLog({ specimenId, fields: { specimenId: 7 } });
        expect(groupReviewLogsBySpecimenId([log]).get(7)).toEqual([log]);
    },
);

test('ignores missing IDs, numeric strings, and display specimen IDs', () => {
    const logs = [
        createReviewLog(),
        createReviewLog({ fields: {} }),
        createReviewLog({ fields: { specimenId: '7' } }),
        createReviewLog({ fields: { specimenId: 'CMS007' } }),
    ];
    expect(groupReviewLogsBySpecimenId(logs).size).toBe(0);
});

test('returns an empty map for no logs', () => {
    expect(groupReviewLogsBySpecimenId([]).size).toBe(0);
});
