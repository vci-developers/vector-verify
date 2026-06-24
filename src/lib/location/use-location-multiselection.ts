import type { Site } from '@/api/site/validation/site-schema';
import {
    isLegacySite,
    type LocationQueryParam,
} from '@/lib/location/location-query';
import {
    getLocationTypeName,
    getSiteAndDescendants,
    getTopLevelSites,
} from '@/lib/location/site-tree';
import { useLocalStorage } from '@/lib/hooks/use-local-storage';
import { useMemo } from 'react';

function getUniqueDistricts(sites: Site[]): string[] {
    const districts = [
        ...new Set(sites.map(site => site.district?.trim()).filter(Boolean)),
    ] as string[];
    return districts.sort();
}

export function useLocationMultiSelection(
    accessibleSites: Site[],
    storageKey: string,
) {
    const [selectedLocations, setSelectedLocations] = useLocalStorage<string[]>(
        storageKey,
        [],
    );

    const usesLegacyStructure =
        accessibleSites.length > 0 && isLegacySite(accessibleSites[0]!);

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

    const selectedSiteIds = useMemo(() => {
        if (usesLegacyStructure) return [];
        return selectedLocations
            .map(name => topLevelSites.find(site => site.name === name)?.siteId)
            .filter((id): id is number => id !== undefined);
    }, [usesLegacyStructure, selectedLocations, topLevelSites]);

    const locationQueryParams: LocationQueryParam[] | undefined =
        useMemo(() => {
            if (selectedLocations.length === 0) return [];
            return usesLegacyStructure
                ? selectedLocations.map(district => ({ district }))
                : selectedSiteIds.map(siteId => ({ siteId }));
        }, [selectedLocations, usesLegacyStructure, selectedSiteIds]);

    const descendantsOfSelectedLocations = useMemo(() => {
        if (selectedLocations.length === 0) return [];
        if (usesLegacyStructure) {
            return accessibleSites.filter(site =>
                selectedLocations.includes(site.district?.trim() ?? ''),
            );
        }
        return selectedSiteIds.flatMap(id =>
            getSiteAndDescendants(accessibleSites, id),
        );
    }, [
        selectedLocations,
        usesLegacyStructure,
        accessibleSites,
        selectedSiteIds,
    ]);

    return {
        selectedLocations,
        setSelectedLocations,
        locationTypeName,
        locationDropdownOptions,
        locationQueryParams,
        descendantsOfSelectedLocations,
    };
}
