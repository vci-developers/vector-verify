import type { Site } from '@/api/site/validation/site-schema';

export type LocationQueryParam = { district: string } | { siteId: number };

export function buildSiteFilter(
    locationQueryParam: LocationQueryParam,
): { district: string } | { siteIds: number[] } {
    return 'district' in locationQueryParam
        ? { district: locationQueryParam.district }
        : { siteIds: [locationQueryParam.siteId] };
}

export function isLegacySite(site: Site): boolean {
    return Object.keys(site.locationHierarchy).length === 0;
}
