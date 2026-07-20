'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';
import SelectableInfoPanelRow from '@/features/operations/geographical-summary/components/selectable-info-panel-row';

interface MarkerInfoPanelProps<Marker> {
    markers: Marker[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    renderMarkerDetails: (marker: Marker) => ReactNode;
    isLoading: boolean;
}

export default function MarkerInfoPanel<
    Marker extends { id: string; siteName: string; parentLocationName: string },
>({
    markers,
    selectedMarkerId,
    onMarkerSelect,
    renderMarkerDetails,
    isLoading,
}: MarkerInfoPanelProps<Marker>) {
    const t = useTranslations('OperationsGeographicalSummary');

    const markersGroupedByLocation = useMemo(() => {
        const groups = new Map<string, Marker[]>();
        for (const marker of markers) {
            const topLevel =
                marker.parentLocationName.split(' · ')[0] ||
                t('unknownLocation');
            const group = groups.get(topLevel) ?? [];
            group.push(marker);
            groups.set(topLevel, group);
        }
        return Array.from(groups.entries()).sort(([a], [b]) =>
            a.localeCompare(b),
        );
    }, [markers, t]);

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
                                    {marker.siteName}
                                </p>
                                {marker.parentLocationName && (
                                    <p className="text-muted-foreground mt-0.5">
                                        {marker.parentLocationName}
                                    </p>
                                )}
                                <div className="text-muted-foreground mt-1.5 space-y-0.5">
                                    {renderMarkerDetails(marker)}
                                </div>
                            </SelectableInfoPanelRow>
                        );
                    })}
                </div>
            ))}
        </SelectableInfoPanel>
    );
}
