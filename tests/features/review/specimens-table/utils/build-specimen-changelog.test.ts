import { expect, test } from 'vitest';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';
import { createReviewLog } from '../../../../helpers/create-review-log';
import { buildSpecimenChangelog } from '@/features/review/specimens-table/utils/build-specimen-changelog';
import { groupReviewLogsBySpecimenId } from '@/features/review/specimens-table/utils/group-review-logs-by-specimen-id';

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
            images: [
                firstImage,
                { ...firstImage, id: 100, url: 'thumbnail.jpg' },
            ],
        },
        89,
        'UTC',
        [log],
    );
    expect(result.edits[0]?.imageNumber).toBe(2);
});

test.each([
    {
        name: 'embedded thumbnail missing from images',
        thumbnailImage: { ...firstImage, id: 100, url: 'thumbnail.jpg' },
        thumbnailImageId: 100,
        thumbnailUrl: null,
    },
    {
        name: 'URL-only thumbnail with a known ID',
        thumbnailImage: null,
        thumbnailImageId: 100,
        thumbnailUrl: 'thumbnail.jpg',
    },
    {
        name: 'URL-only thumbnail without an ID',
        thumbnailImage: null,
        thumbnailImageId: null,
        thumbnailUrl: 'thumbnail.jpg',
    },
])('accounts for $name in image numbering', thumbnail => {
    const { thumbnailImage, thumbnailImageId, thumbnailUrl } = thumbnail;
    const result = buildSpecimenChangelog(
        { ...specimen, thumbnailImage, thumbnailImageId, thumbnailUrl },
        89,
        'UTC',
        [log],
    );
    expect(result.edits[0]?.imageNumber).toBe(2);
});

test('combines specimen-level ID changes with existing image edits', () => {
    const idLog = createReviewLog({
        id: 9,
        action: 'update_specimen_thumbnail_prediction',
        fields: { specimenId: 7, imageId: 99 },
        changes: { specimenId: { before: 'OLD-ID', after: 'CMS007' } },
        performedBy: null,
    });
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [log, idLog]);
    expect(result.edits).toHaveLength(2);
    expect(result.edits[0]).toMatchObject({ scope: 'image', imageNumber: 1 });
    expect(result.edits[1]).toEqual({
        id: 9,
        scope: 'specimen',
        imageNumber: null,
        reviewerName: null,
        createdAt: 1000,
        changes: [
            { field: 'specimenId', previousValue: 'OLD-ID', value: 'CMS007' },
        ],
    });
});

test.each([
    null,
    {},
    { thumbnailImageId: { before: 1, after: 2 } },
    { sessionUnitId: { before: 1, after: 2 } },
    { expectedImages: { before: 1, after: 2 } },
    { specimenId: null },
    { specimenId: { before: 'OLD-ID' } },
    { specimenId: { before: null, after: 'CMS007' } },
    { specimenId: { before: 'OLD-ID', after: 7 } },
])('does not count unrelated or malformed specimen changes: %j', changes => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        createReviewLog({
            action: 'update_specimen_thumbnail_prediction',
            fields: { specimenId: 7 },
            changes,
        }),
    ]);
    expect(result.edits).toEqual([]);
});

test('does not convert other review actions into empty image entries', () => {
    const result = buildSpecimenChangelog(specimen, 89, 'UTC', [
        { ...log, action: 'update_session_household_info' },
    ]);
    expect(result.edits).toEqual([]);
});

test('uses numeric identity, not the renamed display ID, for specimen changes', () => {
    const idLog = createReviewLog({
        action: 'update_specimen_thumbnail_prediction',
        specimenId: 7,
        fields: { specimenId: 8 },
        changes: { specimenId: { before: 'CMS007', after: 'NEW-ID' } },
    });
    expect(
        buildSpecimenChangelog(
            { ...specimen, specimenId: 'NEW-ID' },
            89,
            'UTC',
            [idLog],
        ).edits,
    ).toHaveLength(1);
    expect(
        buildSpecimenChangelog({ ...specimen, id: 8 }, 89, 'UTC', [idLog])
            .edits,
    ).toEqual([]);
});

test('keeps every step of a temporary-value swap attached to the correct specimen', () => {
    const swapLogs = [
        { id: 10, numericId: 7, before: 'A', after: 'TEMP' },
        { id: 11, numericId: 8, before: 'B', after: 'A' },
        { id: 12, numericId: 7, before: 'TEMP', after: 'B' },
    ].map(change =>
        createReviewLog({
            id: change.id,
            createdAt: change.id * 1000,
            action: 'update_specimen_thumbnail_prediction',
            fields: { specimenId: change.numericId },
            changes: {
                specimenId: { before: change.before, after: change.after },
            },
        }),
    );
    const groups = groupReviewLogsBySpecimenId(swapLogs);
    const first = buildSpecimenChangelog(
        { ...specimen, specimenId: 'B' },
        89,
        'UTC',
        groups.get(7) ?? [],
    );
    const second = buildSpecimenChangelog(
        { ...specimen, id: 8, specimenId: 'A' },
        89,
        'UTC',
        groups.get(8) ?? [],
    );
    expect(
        first.edits.flatMap(edit =>
            edit.scope === 'specimen' ? edit.changes : [],
        ),
    ).toEqual([
        { field: 'specimenId', previousValue: 'A', value: 'TEMP' },
        { field: 'specimenId', previousValue: 'TEMP', value: 'B' },
    ]);
    expect(
        second.edits.flatMap(edit =>
            edit.scope === 'specimen' ? edit.changes : [],
        ),
    ).toEqual([{ field: 'specimenId', previousValue: 'B', value: 'A' }]);
});

test('removes thumbnail duplicates by ID or URL before numbering other images', () => {
    const thumbnailImage = {
        ...firstImage,
        id: 100,
        url: 'thumbnail.jpg',
    };
    const result = buildSpecimenChangelog(
        {
            ...specimen,
            thumbnailImageId: 100,
            images: [
                thumbnailImage,
                { ...thumbnailImage },
                { ...thumbnailImage, id: 101 },
                firstImage,
            ],
        },
        89,
        'UTC',
        [log],
    );
    expect(result.edits[0]?.imageNumber).toBe(2);
});
