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
import {
    buildSiteFilter,
    type LocationQueryParam,
} from '@/lib/location/location-query';
import { endOfMonth, format, parseISO, startOfMonth } from 'date-fns';
import { ChevronRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMemo } from 'react';

function buildReviewWorkspaceHref(siteId: number, segment: ReviewSegment): string {
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
    return `/review-next/${siteId}?${queryParams.toString()}`;
}

interface ReviewSitesListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
}

export default function ReviewSitesList({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
    collectionCycles,
    selectedCycleIds,
}: ReviewSitesListProps) {
    const t = useTranslations('CollectionCycle');

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
            case 'unassigned':
                return t('unassigned');
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
                No sites found for this location.
            </p>
        );
    }

    return (
        <div className="space-y-2">
            {segments.map(segment => {
                const buildSiteHref =
                    segment.kind === 'unassigned'
                        ? undefined
                        : (siteId: number) =>
                              buildReviewWorkspaceHref(siteId, segment);
                return (
                    <Collapsible key={segment.key} defaultOpen>
                        <CollapsibleTrigger className="group text-muted-foreground flex w-full items-center gap-2 py-3 text-xs font-semibold tracking-widest uppercase">
                            <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            {getSegmentLabel(segment)}
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ReviewSiteHierarchy
                                sites={sites}
                                summaryBySiteId={segment.summaryBySiteId}
                                buildSiteHref={buildSiteHref}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
