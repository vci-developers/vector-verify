import type { Site } from '@/api/site/validation/site-schema';
import type { SiteDeviceActivity } from '@/features/operations/geographical-summary/utils/device-activity-helpers';
import type { GeocodableMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import {
    buildParentLocationName,
    buildSiteLocationQuery,
    getMarkerName,
    getMarkerSite,
} from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

export const DEVICE_HEALTH_COLOR = {
    active: 'var(--success)',
    inactive: 'var(--count-none)',
} as const;

export interface DeviceMarker extends GeocodableMarker {
    siteName: string | null;
    parentLocationName: string;
    activeDeviceCount: number;
    inactiveDeviceCount: number;
}

export function buildDeviceMarkers(
    sites: SiteDeviceActivity[],
    descendantsOfSelectedLocation: Site[],
): DeviceMarker[] {
    const sitesById = new Map(
        descendantsOfSelectedLocation.map(site => [site.siteId, site]),
    );

    const siteIdsWithChildren = new Set(
        descendantsOfSelectedLocation
            .filter(site => site.parentId != null)
            .map(site => site.parentId!),
    );

    const markerNameToDeviceData = new Map<
        string,
        {
            markerSite: Site;
            activeDeviceCount: number;
            inactiveDeviceCount: number;
        }
    >();

    for (const siteActivity of sites) {
        const site = sitesById.get(siteActivity.siteId);
        if (!site || siteIdsWithChildren.has(siteActivity.siteId)) continue;

        const markerName = getMarkerName(site, sitesById);
        if (!markerName) continue;

        const deviceData = markerNameToDeviceData.get(markerName);
        markerNameToDeviceData.set(markerName, {
            markerSite:
                deviceData?.markerSite ?? getMarkerSite(site, sitesById),
            activeDeviceCount:
                (deviceData?.activeDeviceCount ?? 0) +
                siteActivity.activeDeviceCountAtSite,
            inactiveDeviceCount:
                (deviceData?.inactiveDeviceCount ?? 0) +
                siteActivity.inactiveDeviceCountAtSite,
        });
    }

    return Array.from(markerNameToDeviceData.entries()).map(
        ([markerName, deviceData]) => ({
            id: markerName,
            siteName: markerName,
            parentLocationName: buildParentLocationName(deviceData.markerSite),
            locationQuery: buildSiteLocationQuery(deviceData.markerSite),
            activeDeviceCount: deviceData.activeDeviceCount,
            inactiveDeviceCount: deviceData.inactiveDeviceCount,
        }),
    );
}
