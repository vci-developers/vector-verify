import { expect, test } from 'vitest';
import { getSpecimensQueryParamsSchema } from '@/api/specimen/validation/get-specimens-schema';

test('parses backend search and validates pagination bounds', () => {
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
