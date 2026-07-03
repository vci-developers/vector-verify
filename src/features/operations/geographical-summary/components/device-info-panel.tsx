'use client';

import { useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { DeviceMarker } from '@/features/operations/geographical-summary/utils/device-marker-helpers';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';
import SelectableInfoPanelRow from '@/features/operations/geographical-summary/components/selectable-info-panel-row';

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

    const markersGroupedByLocation = useMemo(() => {
        const groups = new Map<string, DeviceMarker[]>();
        for (const marker of markers) {
            const topLevel =
                marker.parentLocationName.split(' · ')[0] ?? 'Unknown';
            const group = groups.get(topLevel) ?? [];
            group.push(marker);
            groups.set(topLevel, group);
        }
        return Array.from(groups.entries()).sort(([a], [b]) =>
            a.localeCompare(b),
        );
    }, [markers]);

    return (
        <SelectableInfoPanel
            countLabel={t('sitesCount', { count: markers.length })}
        >
            {markersGroupedByLocation.map(([location, groupMarkers]) => (
                <div key={location}>
                    <div className="border-border bg-muted/30 border-b px-3 py-1.5">
                        <p className="text-foreground text-sm font-medium">
                            {location}
                        </p>
                    </div>
                    {groupMarkers.map(marker => {
                        const isSelected = selectedMarkerId === marker.id;
                        return (
                            <SelectableInfoPanelRow
                                key={marker.id}
                                isSelected={isSelected}
                                isLoading={isLoading}
                                onSelect={() =>
                                    onMarkerSelect(
                                        isSelected ? null : marker.id,
                                    )
                                }
                            >
                                <p className="font-semibold">
                                    {marker.siteName ?? t('unknownSite')}
                                </p>
                                {marker.parentLocationName && (
                                    <p className="text-muted-foreground mt-0.5">
                                        {marker.parentLocationName}
                                    </p>
                                )}
                                <div className="text-muted-foreground mt-1.5 space-y-0.5">
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
                                </div>
                            </SelectableInfoPanelRow>
                        );
                    })}
                </div>
            ))}
        </SelectableInfoPanel>
    );
}
