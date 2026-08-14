import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';

export function getSiteDisplayName(site: Site | undefined): string | null {
    if (!site) return null;
    return (isLegacySite(site) ? site.houseNumber : site.name) ?? null;
}
