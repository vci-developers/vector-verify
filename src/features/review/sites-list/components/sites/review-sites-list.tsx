'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import {
    buildSiteFilter,
    type LocationQueryParam,
} from '@/lib/location/location-query';
import { eachMonthOfInterval, endOfMonth, format } from 'date-fns';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import { buildCollectionCycleSegments } from '@/features/review/sites-list/utils/build-collection-cycle-segments';
import { accumulateSessionSummary } from '@/features/review/sites-list/utils/accumulate-session-summary';
import { formatCollectionCycleLabel } from '@/features/review/sites-list/utils/format-collection-cycle-label';
import ReviewSiteHierarchy from '@/features/review/sites-list/components/sites/review-site-hierarchy';
import { type ReviewSiteSessionSummary } from '@/features/review/utils/review-site-session-summary';
import { useTranslations } from 'next-intl';

interface ReviewSiteListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    expandedSitePaths: Set<string>;
    setExpandedSitePaths: (
        value: Set<string> | ((prev: Set<string>) => Set<string>),
    ) => void;
    collapsedSegments: Set<string>;
    setCollapsedSegments: (
        value: Set<string> | ((prev: Set<string>) => Set<string>),
    ) => void;
}

export default function ReviewSitesList({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
    collectionCycles,
    selectedCycleIds,
    expandedSitePaths,
    setExpandedSitePaths,
    collapsedSegments,
    setCollapsedSegments,
}: ReviewSiteListProps) {
    const t = useTranslations('CollectionCycle');
    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            ...buildSiteFilter(locationQueryParam),
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const isCycleMode = collectionCycles.length > 0;
    const months = eachMonthOfInterval({ start: startMonth, end: endMonth });

    const sessionSummariesByMonth = useMemo(() => {
        const map = new Map<string, Map<number, ReviewSiteSessionSummary>>();
        if (!getAllSessionsResult?.ok) return map;

        for (const session of getAllSessionsResult.data.sessions) {
            const monthKey = format(
                new Date(session.collectionDate),
                'yyyy-MM',
            );
            if (!map.has(monthKey)) map.set(monthKey, new Map());
            const monthMap = map.get(monthKey)!;
            monthMap.set(
                session.siteId,
                accumulateSessionSummary(monthMap.get(session.siteId), session),
            );
        }

        return map;
    }, [getAllSessionsResult]);

    const allCycleSegments = useMemo(() => {
        if (!getAllSessionsResult?.ok) return [];
        return buildCollectionCycleSegments(
            getAllSessionsResult.data.sessions,
            collectionCycles,
        );
    }, [getAllSessionsResult, collectionCycles]);

    const cycleSegments = useMemo(() => {
        if (selectedCycleIds.length === 0) return allCycleSegments;
        return allCycleSegments.filter(
            cycleSegment =>
                cycleSegment.cycle !== null &&
                selectedCycleIds.includes(cycleSegment.cycle.id),
        );
    }, [allCycleSegments, selectedCycleIds]);

    function toggleSiteRow(path: string, descendantPaths: string[]) {
        setExpandedSitePaths(previousPaths => {
            const nextPaths = new Set(previousPaths);
            if (nextPaths.has(path)) {
                nextPaths.delete(path);
            } else {
                nextPaths.add(path);
                descendantPaths.forEach(descendantPath =>
                    nextPaths.add(descendantPath),
                );
            }
            return nextPaths;
        });
    }

    function toggleSegment(key: string) {
        setCollapsedSegments(previous => {
            const next = new Set(previous);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    }

    const skeletonCount = new Set(sites.map(site => site.subCounty)).size || 5;

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return (
            <div className="space-y-2">
                {months.map(month => (
                    <div key={format(month, 'yyyy-MM')}>
                        <div className="flex items-center gap-2 py-3">
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <SkeletonList
                            count={skeletonCount}
                            height="xl"
                            width="full"
                        />
                    </div>
                ))}
            </div>
        );
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
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No sites found for this location.
                </p>
            </div>
        );
    }

    if (isCycleMode) {
        return (
            <div className="space-y-2">
                {cycleSegments.map(cycleSegment => {
                    const key =
                        cycleSegment.cycle !== null
                            ? String(cycleSegment.cycle.id)
                            : 'unassigned';
                    const isCollapsed = collapsedSegments.has(key);

                    const segmentStartDate =
                        cycleSegment.cycle !== null
                            ? format(
                                  new Date(cycleSegment.cycle.startDate),
                                  'yyyy-MM-dd',
                              )
                            : startDate;
                    const segmentEndDate =
                        cycleSegment.cycle !== null
                            ? format(
                                  new Date(cycleSegment.cycle.endDate),
                                  'yyyy-MM-dd',
                              )
                            : endDate;

                    const label =
                        cycleSegment.cycle !== null
                            ? formatCollectionCycleLabel(cycleSegment.cycle, t)
                            : t('unassignedSessions');

                    return (
                        <Collapsible
                            key={key}
                            open={!isCollapsed}
                            onOpenChange={() => toggleSegment(key)}
                        >
                            <CollapsibleTrigger className="group flex w-full items-center gap-2 py-3">
                                <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                                <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                                    {label}
                                </span>
                            </CollapsibleTrigger>
                            <CollapsibleContent>
                                <ReviewSiteHierarchy
                                    sites={sites}
                                    parentPath={key}
                                    startDate={segmentStartDate}
                                    endDate={segmentEndDate}
                                    sessionCountsBySiteId={
                                        cycleSegment.sessionSummaryBySiteId
                                    }
                                    expandedSitePaths={expandedSitePaths}
                                    onTogglePath={toggleSiteRow}
                                />
                            </CollapsibleContent>
                        </Collapsible>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {months.map(month => {
                const monthKey = format(month, 'yyyy-MM');
                const sessionCountsBySiteId =
                    sessionSummariesByMonth.get(monthKey) ??
                    new Map<number, ReviewSiteSessionSummary>();
                const isCollapsed = collapsedSegments.has(monthKey);

                return (
                    <Collapsible
                        key={monthKey}
                        open={!isCollapsed}
                        onOpenChange={() => toggleSegment(monthKey)}
                    >
                        <CollapsibleTrigger className="group flex w-full items-center gap-2 py-3">
                            <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                                {format(month, 'MMMM yyyy')}
                            </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ReviewSiteHierarchy
                                sites={sites}
                                parentPath={monthKey}
                                startDate={format(month, 'yyyy-MM-dd')}
                                endDate={format(
                                    endOfMonth(month),
                                    'yyyy-MM-dd',
                                )}
                                sessionCountsBySiteId={sessionCountsBySiteId}
                                expandedSitePaths={expandedSitePaths}
                                onTogglePath={toggleSiteRow}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
