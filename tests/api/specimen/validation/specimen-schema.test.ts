import { expect, test } from 'vitest';
import { specimenSchema } from '@/api/specimen/validation/specimen-schema';

const baseSpecimen = {
    id: 1,
    specimenId: 'KE-0001',
    sessionId: 1867,
    thumbnailUrl: null,
    thumbnailImageId: null,
    thumbnailImage: null,
};

test('parses a numeric, null or missing sessionUnitId', () => {
    expect(
        specimenSchema.parse({ ...baseSpecimen, sessionUnitId: 95 })
            .sessionUnitId,
    ).toBe(95);
    expect(
        specimenSchema.parse({ ...baseSpecimen, sessionUnitId: null })
            .sessionUnitId,
    ).toBeNull();
    expect(specimenSchema.parse(baseSpecimen).sessionUnitId).toBeUndefined();
});
