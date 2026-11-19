import { expect, test } from 'vitest';
import { siteSchema, type Site } from '@/api/site/validation/site-schema';
import {
    getCheckedState,
    getLocationLabel,
    getLocationRowChildSites,
    matchesLocationSearch,
    toggleSiteSelection,
} from '@/lib/location/location-tree';

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

function toggle(
    accessibleSites: Site[],
    selectedSiteIds: number[],
    toggledSiteId: number,
): number[] {
    return toggleSiteSelection(
        accessibleSites,
        selectedSiteIds,
        toggledSiteId,
    ).sort((first, second) => first - second);
}

test('ticking a parent stores only the parent', () => {
    expect(toggle(sites, [111], 1)).toEqual([1]);
});

test('unticking a child under a ticked parent keeps its siblings', () => {
    expect(toggle(sites, [1], 111)).toEqual([12, 112]);
});

test('unticking a selected location removes it', () => {
    expect(toggle(sites, [11, 2], 11)).toEqual([2]);
});

test('ticking every child collapses to the parent, up the tree', () => {
    expect(toggle(sites, [12, 111], 112)).toEqual([1]);
});

test('ticking some children leaves the parents partial', () => {
    expect(getCheckedState(sites, [111], 111)).toBe(true);
    expect(getCheckedState(sites, [111], 11)).toBe('indeterminate');
    expect(getCheckedState(sites, [111], 1)).toBe('indeterminate');
    expect(getCheckedState(sites, [111], 112)).toBe(false);
    expect(getCheckedState(sites, [111], 2)).toBe(false);
});

test('single-child chains collapse into one row', () => {
    const chainSites = [
        buildSite(1, null),
        buildSite(10, 1),
        buildSite(100, 10),
        buildSite(1000, 100),
        buildSite(1001, 100),
    ];

    expect(getLocationLabel(chainSites, chainSites[0]!)).toBe(
        'Site 1 › Site 10 › Site 100',
    );
    expect(
        getLocationRowChildSites(chainSites, chainSites[0]!).map(
            site => site.siteId,
        ),
    ).toEqual([1000, 1001]);
});

test('search matches a site or anything under it', () => {
    expect(matchesLocationSearch(sites, sites[0]!, 'site 112')).toBe(true);
    expect(matchesLocationSearch(sites, sites[1]!, 'site 112')).toBe(true);
    expect(matchesLocationSearch(sites, sites[4]!, 'site 112')).toBe(false);
    expect(matchesLocationSearch(sites, sites[5]!, 'site 112')).toBe(false);
});

test('a site whose parent is not accessible is treated as top level', () => {
    const accessibleSites = [buildSite(11, 1), buildSite(111, 11)];

    expect(toggle(accessibleSites, [], 111)).toEqual([11]);
});
