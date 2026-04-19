'use client';

import { useGetGeocode } from '@/api/geocode/hooks/use-get-geocode';
import { useEffect } from 'react';
import type { LatLngBoundsExpression } from 'leaflet';
import { useMap } from 'react-leaflet';

const FLY_TO_BOUNDS_PADDING: [number, number] = [40, 40];
const FLY_TO_BOUNDS_MAX_ZOOM = 14;
const GEOCODE_ZOOM = 10;

interface MapNavigatorProps {
    bounds: LatLngBoundsExpression | null;
    district: string;
}

// Returns null intentionally — rendered inside MapContainer to access useMap() context,
// requires a descendant component rather than a hook called from the parent.
export default function MapNavigator({ bounds, district }: MapNavigatorProps) {
    const map = useMap();

    const { data: geocodeResult } = useGetGeocode(
        { district },
        { enabled: !bounds },
    );

    useEffect(() => {
        if (bounds) {
            map.flyToBounds(bounds, {
                padding: FLY_TO_BOUNDS_PADDING,
                maxZoom: FLY_TO_BOUNDS_MAX_ZOOM,
            });
            return () => {
                try {
                    map.stop();
                } catch {
                    // Leaflet throws if map is already stopped
                }
            };
        }

        if (geocodeResult?.ok && geocodeResult.data != null) {
            map.flyTo(
                [geocodeResult.data.latitude, geocodeResult.data.longitude],
                GEOCODE_ZOOM,
            );
        }
    }, [map, bounds, geocodeResult]);

    return null;
}
