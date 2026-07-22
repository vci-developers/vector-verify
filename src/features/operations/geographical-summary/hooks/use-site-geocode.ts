'use client';

import { geocodeKeys } from '@/api/geocode/geocode-keys';
import { fetchGeocode } from '@/api/geocode/hooks/use-get-geocode';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import type { Geocode } from '@/api/geocode/validation/geocode-schema';
import type { GeocodableMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

export function useSiteGeocode(
    markers: GeocodableMarker[],
    country: string,
): {
    markerIdsToGeocodedPosition: Map<string, Geocode>;
    isGeocoding: boolean;
} {
    const queryClient = useQueryClient();
    const [markerIdsToGeocodedPosition, setMarkerIdsToGeocodedPosition] =
        useState<Map<string, Geocode>>(new Map());
    const [isGeocoding, setIsGeocoding] = useState(false);

    const markersRef = useRef(markers);
    markersRef.current = markers;

    const markerIds = useMemo(
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
            setMarkerIdsToGeocodedPosition(new Map());
            return;
        }

        let cancelled = false;
        setIsGeocoding(true);

        async function geocodeAllMarkers() {
            const collectedPositions = new Map<string, Geocode>();

            for (const marker of currentMarkers) {
                if (cancelled) break;

                const geocodeResult = await queryClient.fetchQuery({
                    queryKey: geocodeKeys.geocode({
                        location: marker.locationQuery,
                        country,
                    }),
                    queryFn: () =>
                        fetchGeocode({
                            location: marker.locationQuery,
                            country,
                        }),
                });

                if (geocodeResult.ok)
                    collectedPositions.set(marker.id, geocodeResult.data);
            }

            if (!cancelled) {
                setMarkerIdsToGeocodedPosition(collectedPositions);
                setIsGeocoding(false);
            }
        }

        geocodeAllMarkers();

        return () => {
            cancelled = true;
            setIsGeocoding(false);
        };
    }, [markerIds, country, queryClient]);

    return { markerIdsToGeocodedPosition, isGeocoding };
}
