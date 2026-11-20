import type { Site } from '@/api/site/validation/site-schema';
import {
    getSiteAndDescendants,
    getTopLevelSites,
} from '@/lib/location/site-tree';

function getChildSites(accessibleSites: Site[], parentSiteId: number): Site[] {
    return accessibleSites
        .filter(site => site.parentId === parentSiteId)
        .sort((first, second) =>
            (first.name ?? '').localeCompare(second.name ?? ''),
        );
}

function getCollapsedSites(accessibleSites: Site[], site: Site): Site[] {
    const collapsedSites = [site];
    let childSites = getChildSites(accessibleSites, site.siteId);
    while (childSites.length === 1) {
        collapsedSites.push(childSites[0]!);
        childSites = getChildSites(accessibleSites, childSites[0]!.siteId);
    }
    return collapsedSites;
}

export function getLocationLabel(accessibleSites: Site[], site: Site): string {
    return getCollapsedSites(accessibleSites, site)
        .map(collapsedSite => collapsedSite.name)
        .join(' › ');
}

export function getLocationRowChildSites(
    accessibleSites: Site[],
    site: Site,
): Site[] {
    return getChildSites(
        accessibleSites,
        getCollapsedSites(accessibleSites, site).at(-1)!.siteId,
    );
}

function getLeafSiteIds(accessibleSites: Site[], siteId: number): number[] {
    return getSiteAndDescendants(accessibleSites, siteId)
        .filter(
            descendant =>
                !accessibleSites.some(
                    other => other.parentId === descendant.siteId,
                ),
        )
        .map(descendant => descendant.siteId);
}

export function getSelectedLeafSiteIds(
    accessibleSites: Site[],
    selectedSiteIds: number[],
): Set<number> {
    return new Set(
        selectedSiteIds.flatMap(siteId =>
            getLeafSiteIds(accessibleSites, siteId),
        ),
    );
}

function collapseSelectedSiteIds(
    accessibleSites: Site[],
    selectedLeafSiteIds: Set<number>,
    rowSites: Site[],
): number[] {
    return rowSites.flatMap(site =>
        getLeafSiteIds(accessibleSites, site.siteId).every(siteId =>
            selectedLeafSiteIds.has(siteId),
        )
            ? [site.siteId]
            : collapseSelectedSiteIds(
                  accessibleSites,
                  selectedLeafSiteIds,
                  getLocationRowChildSites(accessibleSites, site),
              ),
    );
}

export function getCheckedState(
    accessibleSites: Site[],
    selectedLeafSiteIds: Set<number>,
    siteId: number,
): boolean | 'indeterminate' {
    const leafSiteIds = getLeafSiteIds(accessibleSites, siteId);
    const selectedCount = leafSiteIds.filter(leafSiteId =>
        selectedLeafSiteIds.has(leafSiteId),
    ).length;
    if (selectedCount === 0) return false;
    return selectedCount === leafSiteIds.length ? true : 'indeterminate';
}

export function toggleSiteSelection(
    accessibleSites: Site[],
    selectedSiteIds: number[],
    siteId: number,
): number[] {
    const selectedLeafSiteIds = getSelectedLeafSiteIds(
        accessibleSites,
        selectedSiteIds,
    );
    const leafSiteIds = getLeafSiteIds(accessibleSites, siteId);
    const isChecked = leafSiteIds.every(leafSiteId =>
        selectedLeafSiteIds.has(leafSiteId),
    );
    for (const leafSiteId of leafSiteIds) {
        if (isChecked) {
            selectedLeafSiteIds.delete(leafSiteId);
        } else {
            selectedLeafSiteIds.add(leafSiteId);
        }
    }
    return collapseSelectedSiteIds(
        accessibleSites,
        selectedLeafSiteIds,
        getTopLevelSites(accessibleSites),
    );
}

export function matchesLocationSearch(
    accessibleSites: Site[],
    site: Site,
    search: string,
): boolean {
    const normalizedSearch = search.trim().toLocaleLowerCase();
    return getSiteAndDescendants(accessibleSites, site.siteId).some(
        descendant =>
            (descendant.name ?? '')
                .toLocaleLowerCase()
                .includes(normalizedSearch),
    );
}
