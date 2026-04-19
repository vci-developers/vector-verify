'use client';

import { geocodeKeys } from '@/api/geocode/geocode-keys';
import { fetchGeocode } from '@/api/geocode/hooks/use-get-geocode';
import type { GeocodeQueryParams } from '@/api/geocode/validation/get-geocode-schema';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { VillageMarker } from '@/features/operations/components/geographical-summary/hooks/use-site-markers';

export interface GeocodedPosition {
    latitude: number;
    longitude: number;
}

function markerToGeocodeParams(marker: VillageMarker): GeocodeQueryParams {
    return {
        village: marker.villageName ?? undefined,
        parish: marker.parish ?? undefined,
        subCounty: marker.subCounty ?? undefined,
        district: marker.district ?? undefined,
    };
}

export function useVillageGeocode(markers: VillageMarker[]): {
    positions: Map<string, GeocodedPosition>;
    isGeocoding: boolean;
} {
    const queryClient = useQueryClient();
    const [positions, setPositions] = useState<Map<string, GeocodedPosition>>(
        new Map(),
    );
    const [isGeocoding, setIsGeocoding] = useState(false);

    const markersRef = useRef(markers);
    markersRef.current = markers;

    const villagesKey = useMemo(
        () =>
            markers
                .map(marker => marker.id)
                .sort()
                .join('\x00'),
        [markers],
    );

    useEffect(() => {
        const currentMarkers = markersRef.current;

        if (currentMarkers.length === 0) {
            setPositions(new Map());
            return;
        }

        let cancelled = false;
        setIsGeocoding(true);

        async function collectAllGeocodedPositions() {
            const result = new Map<string, GeocodedPosition>();

            for (const marker of currentMarkers) {
                if (cancelled) break;
                const params = markerToGeocodeParams(marker);
                const geocodeResult = await queryClient.fetchQuery({
                    queryKey: geocodeKeys.geocode(params),
                    queryFn: () => fetchGeocode(params),
                });
                if (geocodeResult.ok) result.set(marker.id, geocodeResult.data);
            }

            if (!cancelled) {
                setPositions(result);
                setIsGeocoding(false);
            }
        }

        collectAllGeocodedPositions();

        return () => {
            cancelled = true;
            setIsGeocoding(false);
        };
    }, [villagesKey, queryClient]);

    return { positions, isGeocoding };
}
