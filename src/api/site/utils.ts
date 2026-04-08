import type { Site } from './validation/site-schema';

export function getSiteTopLevelLocation(site: Site): string | undefined {
    return (Object.values(site.locationHierarchy)[0] ?? site.district)?.trim();
}

export function getSitesLocationLabel(sites: Site[]): string {
    return Object.keys(sites[0]?.locationHierarchy ?? {})[0] ?? 'District';
}

const LEGACY_HIERARCHY_LEVELS = [
    { key: 'subCounty', label: 'Subcounty' },
    { key: 'healthCenter', label: 'Health Center' },
    { key: 'parish', label: 'Parish' },
    { key: 'villageName', label: 'Village' },
    { key: 'houseNumber', label: 'House' },
];

export function getHierarchyLevels(
    sites: Site[],
): { key: string; label: string }[] {
    const firstSite = sites[0];
    if (!firstSite) return LEGACY_HIERARCHY_LEVELS;

    const hierarchyKeys = Object.keys(firstSite.locationHierarchy);
    if (hierarchyKeys.length > 0) {
        return hierarchyKeys.slice(1).map(key => ({ key, label: key }));
    }

    return LEGACY_HIERARCHY_LEVELS;
}
