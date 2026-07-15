'use client';

import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { SkeletonList } from '@/components/ui/skeleton-list';
import ReviewSiteHierarchy from '@/features/review/sites-list/components/sites/review-site-hierarchy';
import {
    buildReviewSegments,
    type ReviewSegment,
} from '@/features/review/sites-list/utils/build-review-segments';
import { filterSegmentByReviewState } from '@/features/review/sites-list/utils/filter-segment-by-review-state';
import type { ReviewState } from '@/features/review/utils/review-site-session-summary';
import {
    buildSiteFilter,
    isLegacySite,
    type LocationQueryParam,
} from '@/lib/location/location-query';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

function buildReviewWorkspaceHref(
    siteId: number,
    segment: ReviewSegment,
): string {
    const queryParams = new URLSearchParams({
        startDate: segment.startDate,
        endDate: segment.endDate,
    });
    if (segment.collectionCycleId !== undefined) {
        queryParams.set('collectionCycleId', String(segment.collectionCycleId));
    }
    if (segment.timezone != null) {
        queryParams.set('timezone', segment.timezone);
    }
    return `/review/${siteId}?${queryParams.toString()}`;
}

interface ReviewSitesListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    selectedReviewStates: ReviewState[];
}

export default function ReviewSitesList({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
    collectionCycles,
    selectedCycleIds,
    selectedReviewStates,
}: ReviewSitesListProps) {
    const t = useTranslations('CollectionCycle');
    const tSitesList = useTranslations('ReviewSitesList');
    const sentinelSiteCount = useMemo(() => {
        if (sites.length === 0) return 0;
        if (isLegacySite(sites[0]!)) return sites.length;
        const parentIds = new Set(
            sites.map(site => site.parentId).filter(id => id != null),
        );
        return sites.filter(site => !parentIds.has(site.siteId)).length;
    }, [sites]);

    const startDate = format(startOfMonth(startMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            ...buildSiteFilter(locationQueryParam),
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const segments = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return buildReviewSegments({
            sessions: getAllSessionsResult.data.sessions,
            collectionCycles,
            selectedCycleIds,
            startMonth,
            endMonth,
        });
    }, [
        getAllSessionsResult,
        collectionCycles,
        selectedCycleIds,
        startMonth,
        endMonth,
    ]);

    function getSegmentLabel(segment: ReviewSegment): string {
        switch (segment.kind) {
            case 'cycle':
                return t('cycleLabel', {
                    cycleNumber: segment.cycleNumber,
                    start: format(parseISO(segment.startDate), 'MMM d'),
                    end: format(parseISO(segment.endDate), 'MMM d, yyyy'),
                });
            case 'month':
                return format(parseISO(segment.startDate), 'MMMM yyyy');
        }
    }

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <SkeletonList count={5} height="xl" width="full" />;
    }

    if (!getAllSessionsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSessionsResult.error.message}
            </p>
        );
    }

    if (sites.length === 0) {
        return (
            <p className="text-muted-foreground py-12 text-center text-sm">
                {tSitesList('noSitesForLocation')}
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {segments.map(segment => {
                const buildSiteHref = (siteId: number) =>
                    buildReviewWorkspaceHref(siteId, segment);
                const visibleSiteIds =
                    selectedReviewStates.length > 0
                        ? filterSegmentByReviewState(
                              segment,
                              selectedReviewStates,
                          )
                        : undefined;
                return (
                    <Collapsible key={segment.key} defaultOpen>
                        <CollapsibleTrigger className="group text-muted-foreground flex w-full items-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase">
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            {getSegmentLabel(segment)}
                            {visibleSiteIds && (
                                <span className="text-muted-foreground/70 ml-1 tracking-normal normal-case">
                                    {tSitesList('showingSitesCount', {
                                        visible: visibleSiteIds.size,
                                        total: sentinelSiteCount,
                                    })}
                                </span>
                            )}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            {visibleSiteIds?.size === 0 ? (
                                <p className="text-muted-foreground py-6 text-center text-sm">
                                    {tSitesList('noSitesMatchFilter')}
                                </p>
                            ) : (
                                <ReviewSiteHierarchy
                                    sites={sites}
                                    visibleSiteIds={visibleSiteIds}
                                    summaryBySiteId={segment.summaryBySiteId}
                                    buildSiteHref={buildSiteHref}
                                />
                            )}
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
