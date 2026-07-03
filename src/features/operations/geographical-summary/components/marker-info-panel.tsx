'use client';

import { useMemo, type ReactNode } from 'react';
import { useTranslations } from 'next-intl';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';
import SelectableInfoPanelRow from '@/features/operations/geographical-summary/components/selectable-info-panel-row';

export interface MarkerRow {
    id: string;
    siteName: string | null;
    parentLocationName: string;
    details: ReactNode;
}

interface MarkerInfoPanelProps {
    markers: MarkerRow[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    isLoading: boolean;
}

export default function MarkerInfoPanel({
    markers,
    selectedMarkerId,
    onMarkerSelect,
    isLoading,
}: MarkerInfoPanelProps) {
    const t = useTranslations('OperationsGeographicalSummary');

    const markersGroupedByLocation = useMemo(() => {
        const groups = new Map<string, MarkerRow[]>();
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
                                    {marker.siteName ?? t('unknownSite')}
                                </p>
                                {marker.parentLocationName && (
                                    <p className="text-muted-foreground mt-0.5">
                                        {marker.parentLocationName}
                                    </p>
                                )}
                                <div className="text-muted-foreground mt-1.5 space-y-0.5">
                                    {marker.details}
                                </div>
                            </SelectableInfoPanelRow>
                        );
                    })}
                </div>
            ))}
        </SelectableInfoPanel>
    );
}
