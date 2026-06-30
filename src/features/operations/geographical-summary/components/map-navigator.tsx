'use client';

import { useGetGeocode } from '@/api/geocode/hooks/use-get-geocode';
import { useEffect } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { useMap } from 'react-leaflet';

const FLY_TO_BOUNDS_PADDING: [number, number] = [40, 40];
const FLY_TO_BOUNDS_MAX_ZOOM = 14;
const SELECTED_LOCATION_ZOOM = 10;

interface MapNavigatorProps {
    bounds: LatLngBoundsExpression | null;
    selectedLocations: string[];
}

export default function MapNavigator({
    bounds,
    selectedLocations,
}: MapNavigatorProps) {
    const map = useMap();

    const { data: geocodeResult } = useGetGeocode(
        { location: selectedLocations[0] ?? '' },
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
