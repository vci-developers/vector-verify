'use client';

import { Fragment, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import MarkerInfoPanel, {
    type MarkerRow,
} from '@/features/operations/geographical-summary/components/marker-info-panel';

interface DeviceInfoPanelProps {
    markers: DeviceMarker[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    isLoading: boolean;
}

export default function DeviceInfoPanel({
    markers,
    selectedMarkerId,
    onMarkerSelect,
    isLoading,
}: DeviceInfoPanelProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    const markerRows = useMemo<MarkerRow[]>(
        () =>
            markers.map(marker => ({
                id: marker.id,
                siteName: marker.siteName,
                parentLocationName: marker.parentLocationName,
                details: (
                    <Fragment>
                        <p>
                            {t('siteActiveCount', {
                                count: marker.activeDeviceCount,
                            })}
                        </p>
                        <p>
                            {t('siteInactiveCount', {
                                count: marker.inactiveDeviceCount,
                            })}
                        </p>
                    </Fragment>
                ),
            })),
        [markers, t],
    );

    return (
        <MarkerInfoPanel
            markers={markerRows}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            isLoading={isLoading}
        />
    );
}
