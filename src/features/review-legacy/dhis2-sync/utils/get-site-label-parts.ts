import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';

export function getSiteLabelParts(site: Site) {
    if (isLegacySite(site)) {
        const parts = [
            site.district,
            site.subCounty,
            site.healthCenter,
            site.parish,
            site.villageName,
            site.houseNumber,
        ].filter((value): value is string => Boolean(value));
        return {
            primaryLabel: parts.at(-1) ?? site.name ?? `Site ${site.siteId}`,
            ancestorLabels: parts.slice(0, -1),
        };
    }
    return {
        primaryLabel: site.name ?? `Site ${site.siteId}`,
        ancestorLabels: Object.values(site.locationHierarchy).filter(
            value => value !== site.name,
        ),
    };
}
