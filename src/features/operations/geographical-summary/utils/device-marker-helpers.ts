import type { Site } from '@/api/site/validation/site-schema';
import type { SiteDeviceActivity } from '@/features/operations/geographical-summary/utils/device-activity-helpers';
import { buildSiteLocationQuery } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

export const DEVICE_HEALTH_COLOR = {
    active: 'var(--success)',
    lapsing: 'var(--warning)',
    inactive: 'var(--count-none)',
} as const;

export interface DeviceMarker {
    id: string;
    siteId: number;
    locationQuery: string;
    activeDeviceCount: number;
    lapsingDeviceCount: number;
}

export function buildDeviceMarkers(
    sites: SiteDeviceActivity[],
    descendantsOfSelectedLocation: Site[],
): DeviceMarker[] {
    const sitesById = new Map(
        descendantsOfSelectedLocation.map(site => [site.siteId, site]),
    );

    return sites.flatMap(siteActivity => {
        const matchingSite = sitesById.get(siteActivity.siteId);
        if (!matchingSite) return [];

        return [
            {
                id: String(siteActivity.siteId),
                siteId: siteActivity.siteId,
                locationQuery: buildSiteLocationQuery(matchingSite),
                activeDeviceCount: siteActivity.activeDeviceCount,
                lapsingDeviceCount: siteActivity.lapsingDeviceCount,
            },
        ];
    });
}
