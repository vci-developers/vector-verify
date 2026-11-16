import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
    getTopLevelSites,
    getUniqueDistricts,
} from '@/lib/location/site-tree';
import { useMemo } from 'react';

export const ALL_LOCATIONS_OPTION = 'All locations';

export function useLocationMultiSelection(
    accessibleSites: Site[],
    selectedLocations: string[],
) {
    const usesLegacyStructure =
        accessibleSites.length > 0 && accessibleSites.some(isLegacySite);

    const topLevelSites = useMemo(
        () => (usesLegacyStructure ? [] : getTopLevelSites(accessibleSites)),
        [usesLegacyStructure, accessibleSites],
    );

    const siteById = useMemo(
        () => new Map(accessibleSites.map(site => [site.siteId, site])),
        [accessibleSites],
    );

    const locationTypeName = usesLegacyStructure
        ? 'District'
        : topLevelSites.length > 0
          ? getLocationTypeName(topLevelSites[0]!)
          : 'Location';

    const locationDropdownOptions = useMemo(
        () => [
            ALL_LOCATIONS_OPTION,
            ...(usesLegacyStructure
                ? getUniqueDistricts(accessibleSites)
                : topLevelSites.map(site => site.name ?? 'Unknown')),
        ],
        [usesLegacyStructure, accessibleSites, topLevelSites],
    );

    const isAllLocationsSelected =
        selectedLocations.includes(ALL_LOCATIONS_OPTION);

    const selectedTreeSiteIds = useMemo(
        () =>
            usesLegacyStructure
                ? []
                : selectedLocations
                      .map(Number)
                      .filter(siteId => siteById.has(siteId)),
        [usesLegacyStructure, selectedLocations, siteById],
    );

    const descendantsOfSelectedLocations = useMemo(() => {
        if (selectedLocations.length === 0) return [];
        if (isAllLocationsSelected) {
            return usesLegacyStructure
                ? accessibleSites.filter(site => site.district?.trim())
                : accessibleSites;
        }
        if (usesLegacyStructure) {
            return accessibleSites.filter(site =>
                selectedLocations.includes(site.district?.trim() ?? ''),
            );
        }
        const selectedDescendantIds = new Set(
            selectedTreeSiteIds.flatMap(siteId =>
                getSiteAndDescendants(accessibleSites, siteId).map(
                    descendant => descendant.siteId,
                ),
            ),
        );
        return accessibleSites.filter(site =>
            selectedDescendantIds.has(site.siteId),
        );
    }, [
        selectedLocations,
        isAllLocationsSelected,
        usesLegacyStructure,
        accessibleSites,
        selectedTreeSiteIds,
    ]);

    const selectedSiteIdsParam: number[] | undefined = useMemo(() => {
        if (descendantsOfSelectedLocations.length === 0) return undefined;
        return descendantsOfSelectedLocations.map(site => site.siteId);
    }, [descendantsOfSelectedLocations]);

    const siteIdToLocationLabel = useMemo(() => {
        const map = new Map<number, string>();
        if (usesLegacyStructure) {
            for (const site of descendantsOfSelectedLocations) {
                map.set(site.siteId, site.district?.trim() ?? '');
            }
        } else {
            const selectedDescendantIds = new Set(
                descendantsOfSelectedLocations.map(site => site.siteId),
            );
            for (const topSite of topLevelSites) {
                for (const descendant of getSiteAndDescendants(
                    accessibleSites,
                    topSite.siteId,
                )) {
                    if (selectedDescendantIds.has(descendant.siteId)) {
                        map.set(descendant.siteId, topSite.name ?? '');
                    }
                }
            }
        }
        return map;
    }, [
        usesLegacyStructure,
        descendantsOfSelectedLocations,
        topLevelSites,
        accessibleSites,
    ]);

    const selectedLocationNames = useMemo(() => {
        if (usesLegacyStructure || isAllLocationsSelected) {
            return [...new Set(siteIdToLocationLabel.values())];
        }
        return selectedTreeSiteIds.map(
            siteId => siteById.get(siteId)?.name ?? '',
        );
    }, [
        usesLegacyStructure,
        isAllLocationsSelected,
        siteIdToLocationLabel,
        selectedTreeSiteIds,
        siteById,
    ]);

    return {
        usesLegacyStructure,
        locationTypeName,
        locationDropdownOptions,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
        selectedLocationNames,
    };
}
