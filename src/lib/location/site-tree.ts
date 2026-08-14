import type { Site } from '@/api/site/validation/site-schema';

export function getTopLevelSites(accessibleSites: Site[]): Site[] {
    const allAccessibleSiteIds = new Set(
        accessibleSites.map(site => site.siteId),
    );

    const topLevelSites = accessibleSites.filter(
        site =>
            site.parentId == null || !allAccessibleSiteIds.has(site.parentId),
    );

    return topLevelSites.sort((a, b) =>
        (a.name ?? '').localeCompare(b.name ?? ''),
    );
}

export function getLocationTypeName(site: Site): string {
    return Object.keys(site.locationHierarchy).at(-1) ?? 'Location';
}

export function getUniqueDistricts(sites: Site[]): string[] {
    const districts = [
        ...new Set(sites.map(site => site.district?.trim()).filter(Boolean)),
    ] as string[];
    return districts.sort();
}

export function getSiteAndDescendants(
    accessibleSites: Site[],
    ancestorSiteId: number,
): Site[] {
    const ancestorAndDescendantSiteIds = new Set<number>([ancestorSiteId]);
    let expandedAllDescendants = false;

    while (!expandedAllDescendants) {
        const sizeBefore = ancestorAndDescendantSiteIds.size;
        for (const site of accessibleSites) {
            if (
                site.parentId != null &&
                ancestorAndDescendantSiteIds.has(site.parentId)
            ) {
                ancestorAndDescendantSiteIds.add(site.siteId);
            }
        }
        expandedAllDescendants =
            ancestorAndDescendantSiteIds.size === sizeBefore;
    }

    return accessibleSites.filter(site =>
        ancestorAndDescendantSiteIds.has(site.siteId),
    );
}
