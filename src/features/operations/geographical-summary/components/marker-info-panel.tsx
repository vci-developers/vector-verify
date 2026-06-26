'use client';

import { useEffect, useMemo, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/utils/cn';
import type { SiteMarker } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';

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
    const panelItemRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

    useEffect(() => {
        if (!selectedMarkerId) return;
        panelItemRefs.current
            .get(selectedMarkerId)
            ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, [selectedMarkerId]);

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
        <div className="border-border flex h-full w-72 shrink-0 flex-col border-l">
            <div className="border-border border-b px-3 py-2">
                <p className="text-sm font-medium">
                    {markers.length} site{markers.length !== 1 ? 's' : ''}
                </p>
            </div>
            <ScrollArea className="min-h-0 flex-1">
                {markersGroupedByLocation.map(([district, groupMarkers]) => (
                    <div key={district}>
                        <div className="border-border bg-muted/30 border-b px-3 py-1.5">
                            <p className="text-foreground text-sm font-medium">
                                {district}
                            </p>
                        </div>
                        {groupMarkers.map(marker => {
                            const isSelected = selectedMarkerId === marker.id;

                            return (
                                <button
                                    key={marker.id}
                                    ref={panelItem => {
                                        if (panelItem)
                                            panelItemRefs.current.set(
                                                marker.id,
                                                panelItem,
                                            );
                                        else
                                            panelItemRefs.current.delete(
                                                marker.id,
                                            );
                                    }}
                                    disabled={isLoading}
                                    onClick={() =>
                                        onMarkerSelect(
                                            isSelected ? null : marker.id,
                                        )
                                    }
                                    className={cn(
                                        'border-border w-full border-b px-3 py-2.5 text-left text-xs transition-colors disabled:cursor-not-allowed disabled:opacity-50',
                                        isSelected
                                            ? 'bg-accent ring-primary ring-1 ring-inset'
                                            : 'hover:bg-muted/40 cursor-pointer',
                                    )}
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
                                            {marker.sessionCount} session
                                            {marker.sessionCount !== 1
                                                ? 's'
                                                : ''}
                                        </p>
                                        <p>
                                            {marker.totalSpecimens.toLocaleString()}{' '}
                                            specimens
                                        </p>
                                        <p>
                                            {marker.anophelesCount.toLocaleString()}{' '}
                                            Anopheles
                                        </p>
                                        {marker.speciesBreakdown.length > 0 && (
                                            <div className="border-border mt-1 space-y-0.5 border-t pt-1">
                                                {marker.speciesBreakdown.map(
                                                    ({ species, count }) => (
                                                        <p key={species}>
                                                            <span className="mr-1">
                                                                ↳
                                                            </span>
                                                            {species}:{' '}
                                                            {count.toLocaleString()}
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
                                </button>
                            );
                        })}
                    </div>
                ))}
            </ScrollArea>
        </div>
    );
}
