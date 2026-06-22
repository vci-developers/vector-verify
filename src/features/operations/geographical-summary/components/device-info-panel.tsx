'use client';

import { useTranslations } from 'next-intl';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import SelectableInfoPanel, {
    SelectableInfoPanelRow,
} from '@/features/operations/geographical-summary/components/selectable-info-panel';

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

    return (
        <SelectableInfoPanel
            countLabel={t('sitesCount', { count: markers.length })}
        >
            {markers.map(marker => {
                const isSelected = selectedMarkerId === marker.id;
                return (
                    <SelectableInfoPanelRow
                        key={marker.id}
                        isSelected={isSelected}
                        isLoading={isLoading}
                        onSelect={() =>
                            onMarkerSelect(isSelected ? null : marker.id)
                        }
                    >
                        <p className="font-semibold">
                            {marker.siteName ?? t('unknownSite')}
                        </p>
                        <div className="text-muted-foreground mt-1.5 space-y-0.5">
                            <p>
                                {t('siteActiveCount', {
                                    count: marker.activeDeviceCount,
                                })}
                            </p>
                            <p>
                                {t('siteLapsingCount', {
                                    count: marker.lapsingDeviceCount,
                                })}
                            </p>
                        </div>
                    </SelectableInfoPanelRow>
                );
            })}
        </SelectableInfoPanel>
    );
}
