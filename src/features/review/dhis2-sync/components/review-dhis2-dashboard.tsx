'use client';

import { useMemo, useState } from 'react';
import Dhis2CycleSegment from './dhis2-cycle-segment';
import Dhis2SyncToolbar from './dhis2-sync-toolbar';
import type { Site } from '@/api/site/validation/site-schema';
import type { LocationQueryParam } from '@/lib/location/location-query';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { endOfMonth, format, startOfMonth } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { buildCollectionCycleSegments } from '../../sites-list/utils/build-collection-cycle-segments';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { formatCollectionCycleLabel } from '../../sites-list/utils/format-collection-cycle-label';
import Dhis2SiteRow from './dhis2-site-row';

interface ReviewDhis2DashboardProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
}

export default function ReviewDhis2Dashboard({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
    collectionCycles,
    selectedCycleIds,
}: ReviewDhis2DashboardProps) {
    const t = useTranslations('CollectionCycle');
    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            ...locationQueryParam,
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const [selectedSiteIds, setSelectedSiteIds] = useState<Set<number>>(
        new Set(),
    );

    function toggleSiteSelected(siteId: number) {
        setSelectedSiteIds(previous => {
            const next = new Set(previous);
            if (next.has(siteId)) next.delete(siteId);
            else next.add(siteId);
            return next;
        });
    }

    const visibleCycleSegments = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return buildCollectionCycleSegments(
            getAllSessionsResult.data.sessions,
            collectionCycles,
        ).filter(
            segment =>
                segment.cycle !== null &&
                (selectedCycleIds.length === 0 ||
                    selectedCycleIds.includes(segment.cycle.id)),
        );
    }, [getAllSessionsResult, collectionCycles, selectedCycleIds]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-foreground text-sm font-semibold tracking-widest uppercase">
                        DHIS2 Submissions
                    </h2>
                    <p className="text-muted-foreground text-xs">
                        Submit certified site data to DHIS2 per collection
                        cycle.
                    </p>
                </div>
                <Dhis2SyncToolbar
                    selectedSiteCount={selectedSiteIds.size}
                    onSubmitSelected={() => {}}
                    onRefresh={() => {}}
                />
            </div>

            {isGetAllSessionsPending || !getAllSessionsResult ? (
                <SkeletonList count={5} height="xl" width="full" />
            ) : !getAllSessionsResult.ok ? (
                <p className="text-destructive text-sm">
                    {getAllSessionsResult.error.message}
                </p>
            ) : sites.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                    <p className="text-muted-foreground text-sm">
                        No sites found for this location.
                    </p>
                </div>
            ) : (
                <div className="space-y-2">
                    {visibleCycleSegments.map(segment => {
                        const cycle = segment.cycle;
                        if (cycle === null) return null;
                        const summaryBySiteId = segment.sessionSummaryBySiteId;
                        const lockedSites = sites.filter(
                            site => summaryBySiteId.get(site.siteId)?.isLocked,
                        );
                        const submittedCount = lockedSites.filter(
                            site => summaryBySiteId.get(site.siteId)?.isSubmitted,
                        ).length;

                        return (
                            <Dhis2CycleSegment
                                key={cycle.id}
                                label={formatCollectionCycleLabel(cycle, t)}
                                submittedCount={submittedCount}
                                siteCount={lockedSites.length}
                            >
                                {lockedSites.map(site => (
                                    <Dhis2SiteRow
                                        key={site.siteId}
                                        site={site}
                                        status={
                                            summaryBySiteId.get(site.siteId)
                                                ?.isSubmitted
                                                ? 'submitted'
                                                : 'ready'
                                        }
                                        isSelected={selectedSiteIds.has(
                                            site.siteId,
                                        )}
                                        onToggleSelected={() =>
                                            toggleSiteSelected(site.siteId)
                                        }
                                    />
                                ))}
                            </Dhis2CycleSegment>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
