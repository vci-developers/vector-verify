import { expect, test } from 'vitest';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { reviewLogSchema } from '@/api/session/validation/get-review-logs-schema';
import { getSpecimensQueryParamsSchema } from '@/api/specimen/validation/get-specimens-schema';
import { buildSpecimenChangelog } from '@/features/review/specimens-table/utils/build-specimen-changelog';

const firstImage = {
    id: 99,
    url: 'image.jpg',
    species: null,
    sex: null,
    abdomenStatus: null,
};
const specimen = specimenSchema.parse({
    id: 7,
    specimenId: 'CMS007',
    sessionId: 1401,
    thumbnailUrl: null,
    thumbnailImageId: null,
    thumbnailImage: null,
    images: [firstImage],
});
const log = reviewLogSchema.parse({
    id: 1,
    specimenId: 7,
    fields: { specimenId: 7, imageId: 99 },
    performedBy: { userId: 2, name: 'Reviewer' },
    createdAt: 1000,
    changes: {
        species: { from: 'Aedes', to: 'Culex' },
        sex: { from: 'Male', to: 'Female' },
    },
});

test('keeps numeric specimen matches, not display specimen IDs', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        log,
        { ...log, id: 2, specimenId: null, fields: { specimenId: 'CMS007' } },
        { ...log, id: 3, specimenId: 8 },
    ]);
    expect(result.edits).toHaveLength(1);
    expect(result.specimenId).toBe('CMS007');
});

test('groups changed fields into one entry per log row', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [log]);
    expect(result.edits).toHaveLength(1);
    expect(result.edits[0]?.changes.map(change => change.field)).toEqual([
        'species',
        'sex',
    ]);
    expect(result.edits[0]).toMatchObject({
        imageNumber: 1,
        reviewerName: 'Reviewer',
    });
});

test('falls back to fields.specimenId when top-level ID is absent', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        { ...log, specimenId: undefined },
    ]);
    expect(result.edits).toHaveLength(1);
});

test('preserves null values and does not invent an image number', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        {
            ...log,
            performedBy: null,
            fields: { imageId: 123 },
            changes: { abdomenStatus: { previousValue: null, value: 'Unfed' } },
        },
    ]);
    expect(result.edits[0]).toMatchObject({
        reviewerName: null,
        imageNumber: null,
        imageId: 123,
        changes: [
            { field: 'abdomenStatus', previousValue: null, value: 'Unfed' },
        ],
    });
});

test('retains edits with unrecognized change details instead of claiming zero edits', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        { ...log, changes: null },
    ]);
    expect(result.edits).toHaveLength(1);
    expect(result.edits[0]?.changes).toEqual([]);
});

test('uses backend search and validates pagination bounds', () => {
    const parsed = getSpecimensQueryParamsSchema.parse({
        specimenId: 'CMS',
        offset: '20',
        limit: '20',
    });
    expect(parsed).toMatchObject({ specimenId: 'CMS', offset: 20, limit: 20 });
    expect(
        getSpecimensQueryParamsSchema.safeParse({ offset: -1 }).success,
    ).toBe(false);
    expect(
        getSpecimensQueryParamsSchema.safeParse({ limit: 101 }).success,
    ).toBe(false);
});

test('uses the same thumbnail-first image numbering as the preview carousel', () => {
    const result = buildSpecimenChangelog(
        {
            ...specimen,
            thumbnailImageId: 100,
            images: [firstImage, { ...firstImage, id: 100 }],
        },
        89,
        'UTC',
        [log],
    );
    expect(result.edits[0]?.imageNumber).toBe(2);
});
