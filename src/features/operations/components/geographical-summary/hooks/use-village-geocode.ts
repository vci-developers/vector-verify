'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import type { VillageMarker } from '@/features/operations/lib/use-site-markers';

export interface GeocodedPosition {
    lat: number;
    lng: number;
}

const geocodeCache = new Map<string, GeocodedPosition>();

async function geocodeVillage(
    marker: VillageMarker,
    signal: AbortSignal,
): Promise<GeocodedPosition | null> {
    const cacheKey = marker.id;
    if (geocodeCache.has(cacheKey)) return geocodeCache.get(cacheKey)!;

    const params = new URLSearchParams();
    if (marker.villageName) params.set('village', marker.villageName);
    if (marker.parish) params.set('parish', marker.parish);
    if (marker.subCounty) params.set('subCounty', marker.subCounty);
    if (marker.district) params.set('district', marker.district);

    try {
        const r = await fetch(`/api/geocode?${params.toString()}`, { signal });
        if (!r.ok) return null;
        const data = (await r.json()) as {
            ok: boolean;
            lat?: number;
            lng?: number;
        };
        if (data.ok && data.lat != null && data.lng != null) {
            const pos = { lat: data.lat, lng: data.lng };
            geocodeCache.set(cacheKey, pos);
            return pos;
        }
    } catch {}
    return null;
}

export function useVillageGeocode(markers: VillageMarker[]): {
    positions: Map<string, GeocodedPosition>;
    isGeocoding: boolean;
} {
    const [positions, setPositions] = useState<Map<string, GeocodedPosition>>(
        new Map(),
    );
    const [isGeocoding, setIsGeocoding] = useState(false);

    const markersRef = useRef(markers);
    markersRef.current = markers;

    const villagesKey = useMemo(
        () =>
            markers
                .map(m => m.id)
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

        const controller = new AbortController();
        setIsGeocoding(true);

        async function geocodeAll() {
            const result = new Map<string, GeocodedPosition>();

            for (const marker of currentMarkers) {
                if (controller.signal.aborted) break;
                const pos = await geocodeVillage(marker, controller.signal);
                if (pos) result.set(marker.id, pos);
            }

            if (!controller.signal.aborted) {
                setPositions(result);
                setIsGeocoding(false);
            }
        }

        geocodeAll();

        return () => {
            controller.abort();
            setIsGeocoding(false);
        };
    }, [villagesKey]);

    return { positions, isGeocoding };
}
