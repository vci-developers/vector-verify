'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { ChevronRight } from 'lucide-react';
import { useMemo } from 'react';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { eachMonthOfInterval, endOfMonth, format } from 'date-fns';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import ReviewSiteHierarchy from './review-site-hierarchy';
import { type ReviewSiteSessionSummary } from '../../utils/review-site-session-summary';

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
    collapsedMonths: Set<string>;
    setCollapsedMonths: (
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
    collapsedMonths,
    setCollapsedMonths,
}: ReviewSiteListProps) {
    const startDate = format(startMonth, 'yyyy-MM-dd');
    const endDate = format(endOfMonth(endMonth), 'yyyy-MM-dd');

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            ...locationQueryParam,
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    const isCycleMode = collectionCycles.length > 0;
    const months = eachMonthOfInterval({ start: startMonth, end: endMonth });

    const sessionSummariesByMonth = useMemo(() => {
        const map = new Map<string, Map<number, ReviewSiteSessionSummary>>();
        if (isCycleMode || !getAllSessionsResult?.ok) return map;

        for (const session of getAllSessionsResult.data.sessions) {
            const monthKey = format(
                new Date(session.collectionDate),
                'yyyy-MM',
            );
            if (!map.has(monthKey)) map.set(monthKey, new Map());

            const monthMap = map.get(monthKey)!;
            const existingSiteSummary = monthMap.get(session.siteId) ?? {
                sessionCount: 0,
                needsReviewCount: 0,
                isLocked: true,
                isCertified: true,
                isSubmitted: true,
            };

            const isLockedSessionState =
                session.state === 'CERTIFIED' ||
                session.state === 'SUBMITTED' ||
                session.state === 'NOT_APPLICABLE';
            const isCertifiedSessionState = session.state === 'CERTIFIED';
            const isSubmittedSessionState = session.state === 'SUBMITTED';

            monthMap.set(session.siteId, {
                sessionCount: existingSiteSummary.sessionCount + 1,
                needsReviewCount:
                    existingSiteSummary.needsReviewCount +
                    (session.state === 'NEEDS_REVIEW' ? 1 : 0),
                isLocked: existingSiteSummary.isLocked && isLockedSessionState,
                isCertified:
                    existingSiteSummary.isCertified && isCertifiedSessionState,
                isSubmitted:
                    existingSiteSummary.isSubmitted && isSubmittedSessionState,
            });
        }

        return map;
    }, [getAllSessionsResult, isCycleMode]);

    const cycleSegments = useMemo(() => {
        if (!isCycleMode || !getAllSessionsResult?.ok) return [];
        const allCycleSegments = buildCollectionCycleSegments(
            getAllSessionsResult.data.sessions,
            collectionCycles,
        );
        if (selectedCycleIds.length === 0) return allCycleSegments;
        return allCycleSegments.filter(
            (cycleSegment: CollectionCycleSegment) =>
                cycleSegment.cycle === null ||
                selectedCycleIds.includes(cycleSegment.cycle.id),
        );
    }, [getAllSessionsResult, collectionCycles, isCycleMode, selectedCycleIds]);

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
        setCollapsedMonths(previous => {
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
                    const isCollapsed = collapsedSegmentKeys.has(key);

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
                            ? `Cycle ${cycleSegment.cycle.cycleNumber} · ${format(new Date(cycleSegment.cycle.startDate), 'MMM d')} – ${format(new Date(cycleSegment.cycle.endDate), 'MMM d, yyyy')}`
                            : 'Unassigned Sessions';

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
                                <ReviewSiteListDateRangeContext.Provider
                                    value={{
                                        startDate: segmentStartDate,
                                        endDate: segmentEndDate,
                                    }}
                                >
                                    <ReviewSiteHierarchy
                                        sites={sites}
                                        depth={0}
                                        parentPath={key}
                                        sessionCountsBySiteId={
                                            cycleSegment.sessionSummaryBySiteId
                                        }
                                        expandedSitePaths={expandedSitePaths}
                                        onToggle={toggleSiteRow}
                                    />
                                </ReviewSiteListDateRangeContext.Provider>
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
                const isCollapsed = collapsedMonths.has(monthKey);

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
                                monthKey={monthKey}
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
