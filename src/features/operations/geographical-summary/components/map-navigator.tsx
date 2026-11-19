'use client';

import { useGetGeocode } from '@/api/geocode/hooks/use-get-geocode';
import { useGetUserPermissions } from '@/api/user/hooks/use-get-user-permissions';
import { useOperationsFilters } from '@/features/operations/view-state/use-operations-filters';
import { useEffect } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { useMap } from 'react-leaflet';
import { useCountry } from '@/features/operations/geographical-summary/context/country-context';

const FLY_TO_BOUNDS_PADDING: [number, number] = [40, 40];
const FLY_TO_BOUNDS_MAX_ZOOM = 14;
const SELECTED_LOCATION_ZOOM = 10;

interface MapNavigatorProps {
    bounds: LatLngBoundsExpression | null;
}

export default function MapNavigator({ bounds }: MapNavigatorProps) {
    const map = useMap();
    const country = useCountry();
    const [{ selectedLocations, selectedSiteIds }] = useOperationsFilters();
    const { data: getUserPermissionsResult } = useGetUserPermissions();
    const selectedSiteName = getUserPermissionsResult?.ok
        ? getUserPermissionsResult.data.permissions.sites.canAccessSites.find(
              site => site.siteId === selectedSiteIds[0],
          )?.name
        : undefined;

    const { data: geocodeResult } = useGetGeocode(
        {
            location: selectedSiteName ?? selectedLocations[0] ?? '',
            country,
        },
        { enabled: !bounds },
    );

    useEffect(() => {
        if (bounds) {
            map.fitBounds(bounds, {
                padding: FLY_TO_BOUNDS_PADDING,
                maxZoom: FLY_TO_BOUNDS_MAX_ZOOM,
                animate: true,
            });
            return () => {
                try {
                    map.stop();
                } catch {}
            };
        }

        if (geocodeResult?.ok && geocodeResult.data != null) {
            map.flyTo(
                [geocodeResult.data.latitude, geocodeResult.data.longitude],
                SELECTED_LOCATION_ZOOM,
            );
        }
    }, [map, bounds, geocodeResult]);

    return null;
}
