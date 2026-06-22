'use client';

import { DivIcon } from 'leaflet';
import { useMemo } from 'react';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { createSpecimenMarkerIcon } from '@/features/operations/geographical-summary/components/create-specimen-marker-icon';
import GeocodedClusterMap from '@/features/operations/geographical-summary/components/geocoded-cluster-map';
import MarkerInfoPanel from '@/features/operations/geographical-summary/components/marker-info-panel';

interface SiteMapProps {
    markers: SiteMarker[];
    selectedLocation: string;
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
}

export default function SiteMap({
    markers,
    selectedLocation,
    selectedMarkerId,
    onMarkerSelect,
}: SiteMapProps) {
    const markerById = useMemo(
        () => new Map(markers.map(marker => [marker.id, marker])),
        [markers],
    );

    return (
        <GeocodedClusterMap
            markers={markers}
            selectedLocation={selectedLocation}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            renderIcon={(markerId, isSelected) => {
                const marker = markerById.get(markerId);
                if (!marker) return new DivIcon();
                return createSpecimenMarkerIcon(
                    marker.totalSpecimens,
                    marker.anophelesCount,
                    isSelected,
                );
            }}
            loadingLabel="Locating sites…"
            renderSidePanel={isLoading => (
                <MarkerInfoPanel
                    markers={markers}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerSelect={onMarkerSelect}
                    isLoading={isLoading}
                />
            )}
        />
    );
}
