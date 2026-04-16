'use client';

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

export default function MapNavigator({ bounds, district }: MapNavigatorProps) {
    const map = useMap();

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
                    /* Leaflet throws if map is already stopped */
                }
            };
        }

        const controller = new AbortController();
        fetch(`/api/geocode?district=${encodeURIComponent(district)}`, {
            signal: controller.signal,
        })
            .then(r => r.json())
            .then((result: { ok: boolean; lat?: number; lng?: number }) => {
                if (result.ok && result.lat != null && result.lng != null) {
                    map.flyTo([result.lat, result.lng], GEOCODE_ZOOM);
                }
            })
            .catch(() => {});

        return () => {
            controller.abort();
            try {
                map.stop();
            } catch {
                /* Leaflet throws if map is already stopped */
            }
        };
    }, [map, bounds, district]);

    return null;
}
