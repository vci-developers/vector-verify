import { expect, test } from 'vitest';
import { siteSchema, type Site } from '@/api/site/validation/site-schema';
import {
    getLocationCheckStates,
    toggleLocationInSelection,
} from '@/features/operations/utils/location-tree-selection';

function buildSite(siteId: number, parentId: number | null): Site {
    return siteSchema.parse({
        siteId,
        programId: 1,
        isActive: true,
        locationHierarchy: { District: 'Bunyangabu' },
        name: `Site ${siteId}`,
        parentId,
    });
}

const sites = [
    buildSite(1, null),
    buildSite(11, 1),
    buildSite(111, 11),
    buildSite(112, 11),
    buildSite(12, 1),
    buildSite(2, null),
];

function sorted(siteIds: number[]): number[] {
    return [...siteIds].sort((first, second) => first - second);
}

test('ticking a parent stores only the parent', () => {
    expect(toggleLocationInSelection(sites, [111], 1)).toEqual([1]);
});

test('unticking a child under a ticked parent keeps its siblings', () => {
    expect(sorted(toggleLocationInSelection(sites, [1], 111))).toEqual([
        12, 112,
    ]);
});

test('unticking a selected location removes it', () => {
    expect(toggleLocationInSelection(sites, [11, 2], 11)).toEqual([2]);
});

test('ticking every child collapses to the parent, up the tree', () => {
    expect(sorted(toggleLocationInSelection(sites, [12, 111], 112))).toEqual([
        1,
    ]);
});

test('ticking some children leaves the parent partial', () => {
    const selectedSiteIds = toggleLocationInSelection(sites, [], 111);
    const checkStates = getLocationCheckStates(sites, selectedSiteIds);

    expect(selectedSiteIds).toEqual([111]);
    expect(checkStates.get(111)).toBe('checked');
    expect(checkStates.get(11)).toBe('indeterminate');
    expect(checkStates.get(1)).toBe('indeterminate');
    expect(checkStates.has(112)).toBe(false);
    expect(checkStates.has(2)).toBe(false);
});

test('descendants of a ticked parent show as checked', () => {
    const checkStates = getLocationCheckStates(sites, [11]);

    expect(checkStates.get(111)).toBe('checked');
    expect(checkStates.get(112)).toBe('checked');
    expect(checkStates.get(1)).toBe('indeterminate');
    expect(checkStates.has(12)).toBe(false);
});

test('a site whose parent is not accessible is treated as top level', () => {
    const accessibleSites = [buildSite(11, 1), buildSite(111, 11)];

    expect(toggleLocationInSelection(accessibleSites, [], 111)).toEqual([11]);
});
