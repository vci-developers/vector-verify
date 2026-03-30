import type { Site } from './validation/site-schema';

export function getSiteTopLevelLocation(site: Site): string | undefined {
    return (Object.values(site.locationHierarchy)[0] ?? site.district)?.trim();
}

export function getSiteLocationLabel(sites: Site[]): string {
    return Object.keys(sites[0]?.locationHierarchy ?? {})[0] ?? 'District';
}
