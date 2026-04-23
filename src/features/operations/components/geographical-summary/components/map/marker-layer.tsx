'use client';

import L from 'leaflet';
import { useState } from 'react';
import { Marker, Tooltip, useMap, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import type { SiteMarker } from '@/features/operations/utils/site-marker-data';
import type { Geocode } from '@/api/geocode/validation/geocode-schema';
import { createSpecimenMarkerIcon } from '@/features/operations/components/geographical-summary/components/map/create-specimen-marker-icon';
import { MarkerTooltipContent } from '@/features/operations/components/geographical-summary/components/map/marker-tooltip-content';

const CLICK_ZOOM = 13;

interface PinnedMarker {
    marker: SiteMarker;
    position: Geocode;
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
    const [pinned, setPinned] = useState<PinnedMarker | null>(null);

    useMapEvents({ click: () => setPinned(null) });

    return (
        <>
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
                                click: e => {
                                    L.DomEvent.stopPropagation(e);
                                    setPinned(prev =>
                                        prev?.marker.id === marker.id
                                            ? null
                                            : { marker, position },
                                    );
                                    map.flyTo(
                                        [position.latitude, position.longitude],
                                        Math.max(map.getZoom(), CLICK_ZOOM),
                                    );
                                },
                            }}
                        >
                            <Tooltip>
                                <MarkerTooltipContent marker={marker} />
                            </Tooltip>
                        </Marker>
                    );
                })}
            </MarkerClusterGroup>

            {pinned && (
                <Marker
                    position={[
                        pinned.position.latitude,
                        pinned.position.longitude,
                    ]}
                    icon={createSpecimenMarkerIcon(
                        pinned.marker.totalSpecimens,
                        pinned.marker.anophelesCount,
                    )}
                    zIndexOffset={1000}
                    eventHandlers={{
                        click: e => {
                            L.DomEvent.stopPropagation(e);
                            setPinned(null);
                        },
                    }}
                >
                    <Tooltip permanent>
                        <MarkerTooltipContent
                            marker={pinned.marker}
                            onClose={() => setPinned(null)}
                        />
                    </Tooltip>
                </Marker>
            )}
        </>
    );
}
