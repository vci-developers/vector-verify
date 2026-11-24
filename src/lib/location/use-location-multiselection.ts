import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import { getLocationLabel } from '@/lib/location/location-tree';
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
    selectedSiteIds: number[],
) {
    const usesLegacyStructure =
        accessibleSites.length > 0 && accessibleSites.some(isLegacySite);

    const topLevelSites = useMemo(
        () => (usesLegacyStructure ? [] : getTopLevelSites(accessibleSites)),
        [usesLegacyStructure, accessibleSites],
    );

    const locationTypeName = usesLegacyStructure
        ? 'District'
        : topLevelSites.length > 0
          ? getLocationTypeName(topLevelSites[0]!)
          : 'Location';

    const locationDropdownOptions = useMemo(
        () => [ALL_LOCATIONS_OPTION, ...getUniqueDistricts(accessibleSites)],
        [accessibleSites],
    );

    const selectedSites = useMemo(() => {
        if (usesLegacyStructure) return [];
        const labelBySiteId = new Map(
            accessibleSites
                .filter(site => selectedSiteIds.includes(site.siteId))
                .map(site => [
                    site.siteId,
                    getLocationLabel(accessibleSites, site),
                ]),
        );
        return accessibleSites
            .filter(site => labelBySiteId.has(site.siteId))
            .sort((first, second) =>
                labelBySiteId
                    .get(first.siteId)!
                    .localeCompare(labelBySiteId.get(second.siteId)!),
            );
    }, [usesLegacyStructure, accessibleSites, selectedSiteIds]);

    const descendantsOfSelectedLocations = useMemo(() => {
        if (usesLegacyStructure) {
            if (selectedLocations.includes(ALL_LOCATIONS_OPTION)) {
                return accessibleSites.filter(site => site.district?.trim());
            }
            return accessibleSites.filter(site =>
                selectedLocations.includes(site.district?.trim() ?? ''),
            );
        }
        return selectedSites.flatMap(site =>
            getSiteAndDescendants(accessibleSites, site.siteId),
        );
    }, [
        usesLegacyStructure,
        selectedLocations,
        accessibleSites,
        selectedSites,
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
            for (const site of selectedSites) {
                const label = getLocationLabel(accessibleSites, site);
                for (const descendant of getSiteAndDescendants(
                    accessibleSites,
                    site.siteId,
                )) {
                    map.set(descendant.siteId, label);
                }
            }
        }
        return map;
    }, [
        usesLegacyStructure,
        descendantsOfSelectedLocations,
        selectedSites,
        accessibleSites,
    ]);

    return {
        usesLegacyStructure,
        locationTypeName,
        locationDropdownOptions,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
    };
}
