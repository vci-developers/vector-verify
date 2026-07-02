'use client';

import { DivIcon } from 'leaflet';
import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import { createDeviceMarkerIcon } from '@/features/operations/geographical-summary/components/create-device-marker-icon';
import GeocodedClusterMap from '@/features/operations/geographical-summary/components/geocoded-cluster-map';
import DeviceInfoPanel from '@/features/operations/geographical-summary/components/device-info-panel';

interface DeviceMapProps {
    markers: DeviceMarker[];
    selectedLocations: string[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
}

export default function DeviceMap({
    markers,
    selectedLocations,
    selectedMarkerId,
    onMarkerSelect,
}: DeviceMapProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    const markerById = useMemo(
        () => new Map(markers.map(marker => [marker.id, marker])),
        [markers],
    );

    return (
        <GeocodedClusterMap
            markers={markers}
            selectedLocations={selectedLocations}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            renderIcon={(markerId, isSelected) => {
                const marker = markerById.get(markerId);
                if (!marker) return new DivIcon();
                return createDeviceMarkerIcon(
                    marker.activeDeviceCount,
                    isSelected,
                );
            }}
            loadingLabel={t('locatingDevices')}
            renderSidePanel={isLoading => (
                <DeviceInfoPanel
                    markers={markers}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerSelect={onMarkerSelect}
                    isLoading={isLoading}
                />
            )}
        />
    );
}
