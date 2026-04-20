import type { Site } from '@/api/site/validation/site-schema';

export type LocationQueryParam = { district: string } | { siteId: number };

export function isLegacySite(site: Site): boolean {
    return Object.keys(site.locationHierarchy).length === 0;
}
