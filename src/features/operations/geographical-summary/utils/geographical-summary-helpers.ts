import type { GetAllSessionsSuccessPayload } from '@/api/session/validation/get-all-sessions-schema';
import type { Site } from '@/api/site/validation/site-schema';
import type { GetSpecimensCountSuccessPayload } from '@/api/specimen/validation/get-specimens-count-schema';
import { isLegacySite } from '@/lib/location/location-query';

export const GEOGRAPHICAL_VIEWS = ['specimens', 'devices'] as const;

export type GeographicalView = (typeof GEOGRAPHICAL_VIEWS)[number];

export const ANOPHELES_THRESHOLD = {
    low: 10,
    moderate: 50,
    high: 100,
} as const;

export const ANOPHELES_COLOR = {
    none: 'var(--count-none)',
    low: 'var(--count-low)',
    moderate: 'var(--count-moderate)',
    high: 'var(--count-high)',
    critical: 'var(--count-critical)',
} as const;

export interface GeocodableMarker {
    id: string;
    locationQuery: string;
}

export interface SiteMarker extends GeocodableMarker {
    siteName: string;
    parentLocationName: string;
    sessionCount: number;
    totalSpecimens: number;
    anophelesCount: number;
    speciesBreakdown: Array<{ species: string; count: number }>;
    lastCollectionDate?: number;
}

function buildLegacyLocationQuery(site: Site, country: string): string {
    const { villageName, parish, subCounty, district } = site;
    const cleanDistrict = district?.replace(/ District$/i, '').trim();
    const countryPart = cleanDistrict
        ? `${cleanDistrict}, ${country}`
        : country;

    let cleanVillage = villageName?.split('+')[0]?.trim() ?? null;

    if (
        cleanVillage &&
        (cleanVillage.toLowerCase() === subCounty?.toLowerCase() ||
            cleanVillage.toLowerCase() === parish?.toLowerCase())
    ) {
        cleanVillage = cleanVillage
            .replace(/ Subcounty$/i, '')
            .replace(/ Parish$/i, '')
            .trim();
    }

    if (cleanVillage) return `${cleanVillage}, ${countryPart}`;
    if (cleanDistrict) return countryPart;
    return country;
}

function buildHierarchicalLocationQuery(site: Site): string {
    const ancestorNames = Object.values(site.locationHierarchy).filter(
        value => value !== site.name,
    );
    const topLevelRegion = ancestorNames[0];
    return [site.name, topLevelRegion].filter(Boolean).join(', ');
}

export function buildSiteLocationQuery(site: Site, country: string): string {
    return isLegacySite(site)
        ? buildLegacyLocationQuery(site, country)
        : buildHierarchicalLocationQuery(site);
}

export function buildParentLocationName(site: Site): string {
    if (isLegacySite(site)) {
        return [site.district, site.subCounty, site.parish]
            .filter(Boolean)
            .join(' · ');
    }
    return Object.values(site.locationHierarchy)
        .filter(value => value !== site.name)
        .join(' · ');
}

export function getMarkerName(
    site: Site,
    sitesById: Map<number, Site>,
): string | null {
    if (isLegacySite(site)) {
        return site.villageName ?? null;
    }
    const parentSite =
        site.parentId != null ? sitesById.get(site.parentId) : null;
    return parentSite?.name ?? site.name ?? null;
}

export function getMarkerSite(site: Site, sitesById: Map<number, Site>): Site {
    if (isLegacySite(site)) return site;
    if (site.parentId != null) {
        return sitesById.get(site.parentId) ?? site;
    }
    return site;
}

export function buildSiteMarkers(
    siteSpecimenCounts: GetSpecimensCountSuccessPayload['data'],
    allSessions: GetAllSessionsSuccessPayload['sessions'],
    descendantsOfSelectedLocation: Site[],
    country: string,
): SiteMarker[] {
    const sitesById = new Map(
        descendantsOfSelectedLocation.map(site => [site.siteId, site]),
    );

    const siteIdsWithChildren = new Set(
        descendantsOfSelectedLocation
            .filter(site => site.parentId != null)
            .map(site => site.parentId!),
    );

    const markerNameToSpecimenData = new Map<
        string,
        {
            markerSite: Site;
            totalSpecimens: number;
            anophelesCount: number;
            speciesCounts: Record<string, number>;
        }
    >();
    const siteIdToMarkerName = new Map<number, string>();

    for (const siteSpecimenCount of siteSpecimenCounts) {
        if (
            !siteSpecimenCount.siteInfo ||
            !sitesById.has(siteSpecimenCount.siteInfo.siteId) ||
            siteIdsWithChildren.has(siteSpecimenCount.siteInfo.siteId)
        )
            continue;

        const markerName = getMarkerName(siteSpecimenCount.siteInfo, sitesById);
        if (!markerName) continue;

        siteIdToMarkerName.set(siteSpecimenCount.siteInfo.siteId, markerName);

        const anophelesCount = siteSpecimenCount.counts
            .filter(speciesCount =>
                speciesCount.species?.toLowerCase().startsWith('anopheles'),
            )
            .reduce((sum, speciesCount) => sum + speciesCount.count, 0);

        const markerData = markerNameToSpecimenData.get(markerName);
        const speciesCounts = { ...(markerData?.speciesCounts ?? {}) };
        for (const speciesCount of siteSpecimenCount.counts) {
            if (!speciesCount.species) continue;
            speciesCounts[speciesCount.species] =
                (speciesCounts[speciesCount.species] ?? 0) + speciesCount.count;
        }

        markerNameToSpecimenData.set(markerName, {
            markerSite:
                markerData?.markerSite ??
                getMarkerSite(siteSpecimenCount.siteInfo, sitesById),
            totalSpecimens:
                (markerData?.totalSpecimens ?? 0) +
                siteSpecimenCount.totalSpecimens,
            anophelesCount: (markerData?.anophelesCount ?? 0) + anophelesCount,
            speciesCounts,
        });
    }

    const markerNameToSessionData = new Map<
        string,
        { sessionCount: number; lastCollectionDate: number }
    >();

    for (const session of allSessions) {
        const markerName = siteIdToMarkerName.get(session.siteId);
        if (!markerName) continue;

        const sessionData = markerNameToSessionData.get(markerName) ?? {
            sessionCount: 0,
            lastCollectionDate: 0,
        };
        markerNameToSessionData.set(markerName, {
            sessionCount: sessionData.sessionCount + 1,
            lastCollectionDate: Math.max(
                sessionData.lastCollectionDate,
                session.collectionDate,
            ),
        });
    }

    return Array.from(markerNameToSpecimenData.entries()).map(
        ([markerName, specimenData]) => {
            const sessionData = markerNameToSessionData.get(markerName);
            const { markerSite } = specimenData;

            const speciesBreakdown = Object.entries(specimenData.speciesCounts)
                .map(([species, count]) => ({ species, count }))
                .sort((a, b) => b.count - a.count);

            const locationQuery = buildSiteLocationQuery(markerSite, country);

            return {
                id: markerName,
                siteName: markerName,
                parentLocationName: buildParentLocationName(markerSite),
                locationQuery,
                sessionCount: sessionData?.sessionCount ?? 0,
                totalSpecimens: specimenData.totalSpecimens,
                anophelesCount: specimenData.anophelesCount,
                speciesBreakdown,
                lastCollectionDate:
                    sessionData?.lastCollectionDate || undefined,
            };
        },
    );
}
