'use client';

import L from 'leaflet';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { VillageMarker } from '@/features/operations/lib/use-site-markers';
import type { GeocodedPosition } from '../../hooks/use-village-geocode';

const CLICK_ZOOM = 13;
const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_SCALE = 20;

export const ANOPHELES_THRESHOLD = {
    low: 10,
    moderate: 50,
    high: 100,
} as const;

export const ANOPHELES_COLOR = {
    none: '#6b7280',
    low: '#3b82f6',
    moderate: '#f97316',
    high: '#ef4444',
    critical: '#991b1b',
} as const;

function createSiteIcon(
    totalSpecimens: number,
    anophelesCount: number,
): L.DivIcon {
    const radius = Math.max(
        MARKER_RADIUS_MIN,
        Math.min(
            MARKER_RADIUS_MAX,
            MARKER_RADIUS_MIN + totalSpecimens / MARKER_RADIUS_SCALE,
        ),
    );
    const size = radius * 2;
    const color =
        anophelesCount === 0
            ? ANOPHELES_COLOR.none
            : anophelesCount < ANOPHELES_THRESHOLD.low
              ? ANOPHELES_COLOR.low
              : anophelesCount < ANOPHELES_THRESHOLD.moderate
                ? ANOPHELES_COLOR.moderate
                : anophelesCount < ANOPHELES_THRESHOLD.high
                  ? ANOPHELES_COLOR.high
                  : ANOPHELES_COLOR.critical;
    return L.divIcon({
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;opacity:0.7;border:2px solid ${color};box-sizing:border-box;"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [radius, radius],
    });
}

interface MarkerLayerProps {
    markers: VillageMarker[];
    positions: Map<string, GeocodedPosition>;
}

export default function MarkerLayer({ markers, positions }: MarkerLayerProps) {
    const map = useMap();

    return (
        <MarkerClusterGroup key={positions.size} chunkedLoading>
            {markers.map(marker => {
                const pos = positions.get(marker.id);
                if (!pos) return null;

                return (
                    <Marker
                        key={marker.id}
                        position={[pos.lat, pos.lng]}
                        icon={createSiteIcon(
                            marker.totalSpecimens,
                            marker.anophelesCount,
                        )}
                        eventHandlers={{
                            click: () => {
                                map.flyTo(
                                    [pos.lat, pos.lng],
                                    Math.max(map.getZoom(), CLICK_ZOOM),
                                );
                            },
                        }}
                    >
                        <Tooltip>
                            <div className="min-w-40 text-xs">
                                <p className="font-semibold">
                                    {marker.villageName}
                                </p>
                                {(marker.district ?? marker.parish) && (
                                    <p className="text-gray-500">
                                        {[marker.district, marker.parish]
                                            .filter(Boolean)
                                            .join(' · ')}
                                    </p>
                                )}
                                <hr className="my-1 border-gray-200" />
                                <p>
                                    {marker.sessionCount} session
                                    {marker.sessionCount !== 1 ? 's' : ''}
                                </p>
                                <p>
                                    {marker.totalSpecimens.toLocaleString()}{' '}
                                    total specimens
                                </p>
                                <p>
                                    {marker.anophelesCount.toLocaleString()}{' '}
                                    Anopheles
                                </p>
                                {marker.speciesBreakdown.length > 0 && (
                                    <div className="mt-1 space-y-0.5 border-t border-gray-200 pt-1">
                                        {marker.speciesBreakdown.map(s => (
                                            <p
                                                key={s.species}
                                                className="text-gray-600"
                                            >
                                                <span className="mr-1 text-gray-400">
                                                    ↳
                                                </span>
                                                {s.species}:{' '}
                                                {s.count.toLocaleString()}
                                            </p>
                                        ))}
                                    </div>
                                )}
                                {marker.lastCollectionDate && (
                                    <p className="text-gray-500">
                                        Last collection:{' '}
                                        {new Date(
                                            marker.lastCollectionDate,
                                        ).toLocaleDateString()}
                                    </p>
                                )}
                            </div>
                        </Tooltip>
                    </Marker>
                );
            })}
        </MarkerClusterGroup>
    );
}
