import { expect, test } from 'vitest';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { createReviewLog } from '../../../../helpers/create-review-log';
import { buildSpecimenChangelog } from '@/features/review/specimens-table/utils/build-specimen-changelog';

const firstImage = {
    id: 99,
    url: 'image.jpg',
    species: null,
    sex: null,
    abdomenStatus: null,
    appSpecies: null,
    appSex: null,
    appAbdomenStatus: null,
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
const log = createReviewLog({
    id: 1,
    specimenId: 7,
    fields: { specimenId: 7, imageId: 99 },
    performedBy: { userId: 2, name: 'Reviewer' },
    createdAt: 1000,
    changes: {
        image: {
            species: { before: 'Culex', after: 'Aedes' },
            sex: { before: 'Female', after: 'Male' },
            abdomenStatus: { before: 'Gravid', after: '' },
        },
    },
});

test('preserves the supplied specimen log order and display specimen ID', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        { ...log, id: 2 },
        log,
    ]);
    expect(result.edits.map(edit => edit.id)).toEqual([2, 1]);
    expect(result.specimenId).toBe('CMS007');
});

test('groups nested image changes into one entry and preserves empty strings', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [log]);
    expect(result.edits).toHaveLength(1);
    expect(result.edits[0]?.changes).toEqual([
        { field: 'species', previousValue: 'Culex', value: 'Aedes' },
        { field: 'sex', previousValue: 'Female', value: 'Male' },
        { field: 'abdomenStatus', previousValue: 'Gravid', value: '' },
    ]);
    expect(result.edits[0]).toMatchObject({
        imageNumber: 1,
        reviewerName: 'Reviewer',
    });
});

test('returns no edits when the specimen has no logs', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', []);
    expect(result.edits).toEqual([]);
});

test('preserves null values and does not invent an image number', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        {
            ...log,
            performedBy: null,
            fields: { imageId: 123 },
            changes: {
                image: { abdomenStatus: { before: null, after: 'Unfed' } },
            },
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

test.each([null, {}, { image: null }, { image: [] }])(
    'retains edits with missing or invalid image changes: %j',
    changes => {
        const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
            { ...log, changes },
        ]);
        expect(result.edits).toHaveLength(1);
        expect(result.edits[0]?.changes).toEqual([]);
    },
);

test('keeps valid fields when other image changes are malformed or unsupported', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        {
            ...log,
            changes: {
                image: {
                    species: { before: 'Culex', after: 'Aedes' },
                    sex: { from: 'Female', to: 'Male' },
                    abdomenStatus: { before: 'Gravid' },
                },
            },
        },
    ]);
    expect(result.edits[0]?.changes).toEqual([
        { field: 'species', previousValue: 'Culex', value: 'Aedes' },
    ]);
});

test('does not interpret top-level changes as image prediction changes', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        {
            ...log,
            changes: { species: { before: 'Culex', after: 'Aedes' } },
        },
    ]);
    expect(result.edits).toHaveLength(1);
    expect(result.edits[0]?.changes).toEqual([]);
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
