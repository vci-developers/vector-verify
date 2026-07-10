'use client';

import { DivIcon } from 'leaflet';
import { Fragment, useMemo } from 'react';
import { useTranslations } from 'next-intl';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { createSpecimenMarkerIcon } from '@/features/operations/geographical-summary/components/create-specimen-marker-icon';
import GeocodedClusterMap from '@/features/operations/geographical-summary/components/geocoded-cluster-map';
import MarkerInfoPanel from '@/features/operations/geographical-summary/components/marker-info-panel';

interface SiteMapProps {
    markers: SiteMarker[];
    selectedLocations: string[];
    selectedMarkerId: string | null;
    onMarkerSelect: (id: string | null) => void;
}

export default function SiteMap({
    markers,
    selectedLocations,
    selectedMarkerId,
    onMarkerSelect,
}: SiteMapProps) {
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
                return createSpecimenMarkerIcon(
                    marker.totalSpecimens,
                    marker.anophelesCount,
                    isSelected,
                );
            }}
            loadingLabel="Locating sites…"
            renderSidePanel={isLoading => (
                <MarkerInfoPanel
                    markers={markers}
                    selectedMarkerId={selectedMarkerId}
                    onMarkerSelect={onMarkerSelect}
                    renderMarkerDetails={markerId => {
                        const marker = markerById.get(markerId);
                        if (!marker) return null;
                        return (
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
                            </Fragment>
                        );
                    }}
                    isLoading={isLoading}
                />
            )}
        />
    );
}
