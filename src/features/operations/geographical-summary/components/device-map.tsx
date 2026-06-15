'use client';

import { useTranslations } from 'next-intl';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import { createDeviceMarkerIcon } from '@/features/operations/geographical-summary/components/create-device-marker-icon';
import GeocodedClusterMap from '@/features/operations/geographical-summary/components/geocoded-cluster-map';
import DeviceInfoPanel, {
    type DeviceSiteRow,
} from '@/features/operations/geographical-summary/components/device-info-panel';

interface DeviceMapProps {
    markers: DeviceMarker[];
    siteRows: DeviceSiteRow[];
    selectedLocation: string;
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
}

export default function DeviceMap({
    markers,
    siteRows,
    selectedLocation,
    selectedMarkerId,
    onMarkerSelect,
}: DeviceMapProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    return (
        <GeocodedClusterMap
            markers={markers}
            selectedLocation={selectedLocation}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            renderIcon={(marker, isSelected) =>
                createDeviceMarkerIcon(
                    marker.activeDeviceCount,
                    marker.lapsingDeviceCount,
                    isSelected,
                )
            }
            loadingLabel={t('locatingDevices')}
            renderSidePanel={isLoading => (
                <DeviceInfoPanel
                    sites={siteRows}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerSelect={onMarkerSelect}
                    isLoading={isLoading}
                />
            )}
        />
    );
}
