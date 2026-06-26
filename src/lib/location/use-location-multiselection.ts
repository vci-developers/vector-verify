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

    const locationQueryParams: LocationQueryParam[] = useMemo(() => {
        if (selectedLocations.length === 0) return [];
        if (usesLegacyStructure) {
            return selectedLocations.map(district => ({ district }));
        }
        return selectedLocations
            .map(name => topLevelSites.find(s => s.name === name)?.siteId)
            .filter((id): id is number => id !== undefined)
            .map(siteId => ({ siteId }));
    }, [selectedLocations, usesLegacyStructure, topLevelSites]);

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
        selectedLocations,
        setSelectedLocations,
        locationTypeName,
        locationDropdownOptions,
        locationQueryParams,
        selectedSiteIdsParam,
        descendantsOfSelectedLocations,
        siteIdToLocationLabel,
    };
}
