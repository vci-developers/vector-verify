'use client';

import { Fragment } from 'react';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import SelectableInfoPanel from '@/features/operations/geographical-summary/components/selectable-info-panel';

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
    return (
        <SelectableInfoPanel
            items={markers}
            getItemId={marker => marker.id}
            selectedMarkerId={selectedMarkerId}
            onMarkerSelect={onMarkerSelect}
            isLoading={isLoading}
            countLabel={`${markers.length} site${markers.length !== 1 ? 's' : ''}`}
            renderRow={marker => (
                <Fragment>
                    <p className="font-semibold">{marker.siteName}</p>
                    {marker.parentLocationName && (
                        <p className="text-muted-foreground mt-0.5">
                            {marker.parentLocationName}
                        </p>
                    )}
                    <div className="text-muted-foreground mt-1.5 space-y-0.5">
                        <p>
                            {marker.sessionCount} session
                            {marker.sessionCount !== 1 ? 's' : ''}
                        </p>
                        <p>
                            {marker.totalSpecimens.toLocaleString()} specimens
                        </p>
                        <p>
                            {marker.anophelesCount.toLocaleString()} Anopheles
                        </p>
                        {marker.speciesBreakdown.length > 0 && (
                            <div className="border-border mt-1 space-y-0.5 border-t pt-1">
                                {marker.speciesBreakdown.map(
                                    ({ species, count }) => (
                                        <p key={species}>
                                            <span className="mr-1">↳</span>
                                            {species}: {count.toLocaleString()}
                                        </p>
                                    ),
                                )}
                            </div>
                        )}
                        {marker.lastCollectionDate && (
                            <p className="mt-1">
                                Last:{' '}
                                {new Date(
                                    marker.lastCollectionDate,
                                ).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </Fragment>
            )}
        />
    );
}
