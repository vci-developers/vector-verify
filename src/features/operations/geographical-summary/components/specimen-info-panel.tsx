'use client';

import { Fragment, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import MarkerInfoPanel, {
    type MarkerRow,
} from '@/features/operations/geographical-summary/components/marker-info-panel';

interface SpecimenInfoPanelProps {
    markers: SiteMarker[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
    isLoading: boolean;
}

export default function SpecimenInfoPanel({
    markers,
    selectedMarkerId,
    onMarkerSelect,
    isLoading,
}: SpecimenInfoPanelProps) {
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
