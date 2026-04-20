'use client';

import L from 'leaflet';
import { Marker, Tooltip, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import {
    ANOPHELES_COLOR,
    ANOPHELES_THRESHOLD,
    type SiteMarker,
} from '@/features/operations/utils/site-marker-data';
import type { Geocode } from '@/api/geocode/validation/geocode-schema';

const MAX_SPECIES_IN_TOOLTIP = 5;
const CLICK_ZOOM = 13;
const MARKER_RADIUS_MIN = 8;
const MARKER_RADIUS_MAX = 26;
const MARKER_RADIUS_SCALE = 20;

function createSpecimenMarkerIcon(
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
        html: `<div style="width:${size}px;height:${size}px;background:${color};border-radius:50%;border:2.5px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.4);box-sizing:border-box;"></div>`,
        className: '',
        iconSize: [size, size],
        iconAnchor: [radius, radius],
    });
}

interface MarkerLayerProps {
    markers: SiteMarker[];
    markerIdsToGeocodedPosition: Map<string, Geocode>;
}

export default function MarkerLayer({
    markers,
    markerIdsToGeocodedPosition,
}: MarkerLayerProps) {
    const map = useMap();

    return (
        <MarkerClusterGroup
            key={markerIdsToGeocodedPosition.size}
            chunkedLoading
        >
            {markers.map(marker => {
                const position = markerIdsToGeocodedPosition.get(marker.id);
                if (!position) return null;

                return (
                    <Marker
                        key={marker.id}
                        position={[position.latitude, position.longitude]}
                        icon={createSpecimenMarkerIcon(
                            marker.totalSpecimens,
                            marker.anophelesCount,
                        )}
                        eventHandlers={{
                            click: () => {
                                map.flyTo(
                                    [position.latitude, position.longitude],
                                    Math.max(map.getZoom(), CLICK_ZOOM),
                                );
                            },
                        }}
                    >
                        <Tooltip>
                            <div className="min-w-40 text-xs">
                                <p className="font-semibold">
                                    {marker.siteName}
                                </p>
                                {marker.parentLocationName && (
                                    <p className="text-muted-foreground">
                                        {marker.parentLocationName}
                                    </p>
                                )}
                                <hr className="border-border my-1" />
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
                                    <div className="border-border mt-1 space-y-0.5 border-t pt-1">
                                        {marker.speciesBreakdown
                                            .slice(0, MAX_SPECIES_IN_TOOLTIP)
                                            .map(({ species, count }) => (
                                                <p
                                                    key={species}
                                                    className="text-muted-foreground"
                                                >
                                                    <span className="mr-1">
                                                        ↳
                                                    </span>
                                                    {species}:{' '}
                                                    {count.toLocaleString()}
                                                </p>
                                            ))}
                                    </div>
                                )}
                                {marker.lastCollectionDate && (
                                    <p className="text-muted-foreground">
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
