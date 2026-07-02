'use client';

import { useTranslations } from 'next-intl';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';
import SelectableInfoPanelRow from '@/features/operations/geographical-summary/components/selectable-info-panel-row';
import { useMemo } from 'react';

interface MarkerInfoPanelProps {
    markers: SiteMarker[];
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
        const groups = new Map<string, SiteMarker[]>();
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
                                    {marker.siteName}
                                </p>
                                {marker.parentLocationName && (
                                    <p className="text-muted-foreground mt-0.5">
                                        {marker.parentLocationName}
                                    </p>
                                )}
                                <div className="text-muted-foreground mt-1.5 space-y-0.5">
                                    <p>
                                        {t('siteSessionCount', {
                                            count: marker.sessionCount,
                                        })}
                                    </p>
                                    <p>
                                        {t('siteSpecimenCount', {
                                            count: marker.totalSpecimens,
                                        })}
                                    </p>
                                    <p>
                                        {t('siteAnophelesCount', {
                                            count: marker.anophelesCount,
                                        })}
                                    </p>
                                    {marker.speciesBreakdown.length > 0 && (
                                        <div className="border-border mt-1 space-y-0.5 border-t pt-1">
                                            {marker.speciesBreakdown.map(
                                                ({ species, count }) => (
                                                    <p key={species}>
                                                        <span className="mr-1">
                                                            ↳
                                                        </span>
                                                        {t('siteSpeciesCount', {
                                                            species,
                                                            count,
                                                        })}
                                                    </p>
                                                ),
                                            )}
                                        </div>
                                    )}
                                    {marker.lastCollectionDate && (
                                        <p className="mt-1">
                                            {t('siteLastCollection', {
                                                date: new Date(
                                                    marker.lastCollectionDate,
                                                ).toLocaleDateString(),
                                            })}
                                        </p>
                                    )}
                                </div>
                            </SelectableInfoPanelRow>
                        );
                    })}
                </div>
            ))}
        </SelectableInfoPanel>
    );
}
