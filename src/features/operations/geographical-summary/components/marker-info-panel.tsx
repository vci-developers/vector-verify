'use client';

import { useTranslations } from 'next-intl';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';
import SelectableInfoPanelRow from '@/features/operations/geographical-summary/components/selectable-info-panel-row';

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
                        <p className="font-semibold">{marker.siteName}</p>
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
                                                <span className="mr-1">↳</span>
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
        </SelectableInfoPanel>
    );
}
