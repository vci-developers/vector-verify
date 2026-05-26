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

export function useLocationSelection(
    accessibleSites: Site[],
    storageKey: string,
) {
    const [selectedLocation, setSelectedLocation] = useLocalStorage(
        storageKey,
        '',
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

    const selectedSiteId = useMemo(() => {
        if (usesLegacyStructure || !selectedLocation) return undefined;
        return topLevelSites.find(site => site.name === selectedLocation)
            ?.siteId;
    }, [usesLegacyStructure, selectedLocation, topLevelSites]);

    const locationQueryParam: LocationQueryParam | undefined = useMemo(() => {
        if (!selectedLocation) return undefined;
        if (usesLegacyStructure) return { district: selectedLocation };
        return selectedSiteId !== undefined
            ? { siteId: selectedSiteId }
            : undefined;
    }, [selectedLocation, usesLegacyStructure, selectedSiteId]);

    const descendantsOfSelectedLocation = useMemo(() => {
        if (!selectedLocation) return [];
        if (usesLegacyStructure) {
            return accessibleSites.filter(
                site => site.district?.trim() === selectedLocation,
            );
        }
        return selectedSiteId !== undefined
            ? getSiteAndDescendants(accessibleSites, selectedSiteId)
            : [];
    }, [
        selectedLocation,
        usesLegacyStructure,
        accessibleSites,
        selectedSiteId,
    ]);

    return {
        selectedLocation,
        setSelectedLocation,
        locationTypeName,
        locationDropdownOptions,
        locationQueryParam,
        descendantsOfSelectedLocation,
    };
}
