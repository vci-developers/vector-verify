import type { Site } from '@/api/site/validation/site-schema';
import { getMarkerSite } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import type { ReportingSegment } from '@/features/operations/field-user-compliance/utils/reporting-segment-helpers';
import { countCollectors } from '@/features/operations/field-user-compliance/utils/site-collector-helpers';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteIdsWithChildren,
} from '@/lib/location/site-tree';

export interface ReportingLocation {
    locationSite: Site;
    sites: Site[];
}

export function getReportingLocationKey(location: ReportingLocation): string {
    const { locationSite } = location;
    if (!isLegacySite(locationSite)) return String(locationSite.siteId);
    return [
        locationSite.district,
        locationSite.subCounty,
        locationSite.healthCenter,
        locationSite.parish,
        locationSite.villageName,
    ]
        .map(locationName => locationName?.trim() ?? '')
        .join('|');
}

export function getReportingLocationName(location: ReportingLocation): string {
    return (
        (isLegacySite(location.locationSite)
            ? location.locationSite.villageName?.trim()
            : location.locationSite.name) ?? ''
    );
}

export function getReportingLocationParentName(
    location: ReportingLocation,
): string | null | undefined {
    if (isLegacySite(location.locationSite))
        return location.locationSite.district;
    return Object.values(location.locationSite.locationHierarchy)
        .filter(locationName => locationName !== location.locationSite.name)
        .at(-1);
}

export function getHierarchicalLevelNames(
    sites: Site[],
): { locationLevelName: string; siteLevelName: string } | null {
    const levelSite =
        sites.find(site => Object.keys(site.locationHierarchy).length > 1) ??
        sites[0];
    if (!levelSite || isLegacySite(levelSite)) return null;
    const siteLevelName = getLocationTypeName(levelSite);
    return {
        locationLevelName:
            Object.keys(levelSite.locationHierarchy).at(-2) ?? siteLevelName,
        siteLevelName,
    };
}

export function buildReportingLocations(sites: Site[]): ReportingLocation[] {
    const sitesById = new Map(sites.map(site => [site.siteId, site]));
    const siteIdsWithChildren = getSiteIdsWithChildren(sites);
    const locationByKey = new Map<string, ReportingLocation>();
    for (const site of sites) {
        if (!site.isActive || siteIdsWithChildren.has(site.siteId)) continue;
        const newLocation: ReportingLocation = {
            locationSite: getMarkerSite(site, sitesById),
            sites: [],
        };
        const locationKey = getReportingLocationKey(newLocation);
        const location = locationByKey.get(locationKey) ?? newLocation;
        location.sites.push(site);
        locationByKey.set(locationKey, location);
    }
    return [...locationByKey.values()].sort((firstLocation, secondLocation) =>
        getReportingLocationName(firstLocation).localeCompare(
            getReportingLocationName(secondLocation),
        ),
    );
}

export function countReportingSites(
    sites: Site[],
    segment: ReportingSegment,
): number {
    return sites.filter(site => segment.sessionsBySiteId.has(site.siteId))
        .length;
}

export function isSegmentFullyReported(
    sites: Site[],
    segment: ReportingSegment,
): boolean {
    return countReportingSites(sites, segment) === sites.length;
}

export function getSiteReportingStats(
    locations: ReportingLocation[],
    segments: ReportingSegment[],
) {
    const sites = locations.flatMap(location => location.sites);
    return {
        fullyReportingLocationCount: locations.filter(location =>
            segments.every(segment =>
                isSegmentFullyReported(location.sites, segment),
            ),
        ).length,
        reportingSiteCount: sites.filter(site =>
            segments.some(segment => segment.sessionsBySiteId.has(site.siteId)),
        ).length,
        collectorCount: countCollectors(sites, segments),
        fullyReportedSegmentCount: segments.filter(segment =>
            isSegmentFullyReported(sites, segment),
        ).length,
    };
}
