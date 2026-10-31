import { expect, test } from 'vitest';
import { siteSchema } from '@/api/site/validation/site-schema';
import { getSiteDisplayName } from '@/lib/location/get-site-display-name';

const site = siteSchema.parse({
    siteId: 90,
    programId: 1,
    isActive: true,
    locationHierarchy: { District: 'East' },
    name: 'AD 70',
    houseNumber: 'House 12',
});

test('uses the name for a hierarchical site', () => {
    expect(getSiteDisplayName(site)).toBe('AD 70');
});

test('uses the house number for a legacy site even when it has a name', () => {
    expect(getSiteDisplayName({ ...site, locationHierarchy: {} })).toBe(
        'House 12',
    );
});

test.each([null, undefined, ''])(
    'preserves missing and empty labels without switching naming conventions: %s',
    value => {
        expect(getSiteDisplayName({ ...site, name: value })).toBe(
            value ?? null,
        );
        expect(
            getSiteDisplayName({
                ...site,
                locationHierarchy: {},
                houseNumber: value,
            }),
        ).toBe(value ?? null);
    },
);

test('returns null when site context is unavailable', () => {
    expect(getSiteDisplayName(undefined)).toBeNull();
});
