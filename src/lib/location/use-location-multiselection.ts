import type { Site } from '@/api/site/validation/site-schema';
import { isLegacySite } from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
    getTopLevelSites,
    getUniqueDistricts,
} from '@/lib/location/site-tree';
import { useMemo } from 'react';

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

    const locationTypeName = usesLegacyStructure
        ? 'District'
        : topLevelSites.length > 0
          ? getLocationTypeName(topLevelSites[0]!)
          : 'Location';

    const locationDropdownOptions = useMemo(
        () =>
            usesLegacyStructure
                ? getUniqueDistricts(accessibleSites)
                : topLevelSites.map(site => site.name ?? 'Unknown'),
        [usesLegacyStructure, accessibleSites, topLevelSites],
    );

    const descendantsOfSelectedLocations = useMemo(() => {
        if (selectedLocations.length === 0) return [];
        if (usesLegacyStructure) {
            return accessibleSites.filter(site =>
                selectedLocations.includes(site.district?.trim() ?? ''),
            );
        }
        const selectedSiteIds = selectedLocations
            .map(name => topLevelSites.find(s => s.name === name)?.siteId)
            .filter((id): id is number => id !== undefined);
        return selectedSiteIds.flatMap(id =>
            getSiteAndDescendants(accessibleSites, id),
        );
    }, [
        selectedLocations,
        usesLegacyStructure,
        accessibleSites,
        topLevelSites,
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
            for (const topSite of topLevelSites) {
                if (!selectedLocations.includes(topSite.name ?? '')) continue;
                for (const descendant of getSiteAndDescendants(
                    accessibleSites,
                    topSite.siteId,
                )) {
                    map.set(descendant.siteId, topSite.name ?? '');
                }
            }
        }
        return map;
    }, [
        usesLegacyStructure,
        descendantsOfSelectedLocations,
        topLevelSites,
        selectedLocations,
        accessibleSites,
    ]);

    return {
        locationTypeName,
        locationDropdownOptions,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
    };
}
