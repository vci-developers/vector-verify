import { expect, test } from 'vitest';
import {
    putSpecimenByIdRequestSchema,
    putSpecimenByIdResponseSchema,
} from '@/api/specimen/validation/put-specimen-by-id-schema';

test('trims the ID and sends only the editable field', () => {
    expect(
        putSpecimenByIdRequestSchema.parse({
            specimenId: '  URJ206 \n',
            thumbnailImageId: 99,
        }),
    ).toEqual({ specimenId: 'URJ206' });
});

test.each(['', ' ', '\t\n', null, undefined, 123])(
    'rejects an empty or non-string ID: %s',
    specimenId => {
        expect(
            putSpecimenByIdRequestSchema.safeParse({ specimenId }).success,
        ).toBe(false);
    },
);

test('validates the documented message and specimen response', () => {
    const response = {
        message: 'Specimen updated',
        specimen: {
            id: 12,
            specimenId: 'URJ206',
            sessionId: 4,
            thumbnailUrl: null,
            thumbnailImageId: null,
            thumbnailImage: null,
            molecularSpecies: null,
        },
    };
    expect(putSpecimenByIdResponseSchema.parse(response)).toMatchObject({
        message: response.message,
        specimen: { id: 12, specimenId: 'URJ206' },
    });
    expect(
        putSpecimenByIdResponseSchema.safeParse({
            ...response,
            specimen: { ...response.specimen, id: '12' },
        }).success,
    ).toBe(false);
    expect(
        putSpecimenByIdResponseSchema.safeParse({ message: 'Updated' }).success,
    ).toBe(false);
});
