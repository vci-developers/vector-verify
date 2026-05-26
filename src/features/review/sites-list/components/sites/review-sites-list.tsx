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
import { ReviewSiteListMonthKeyContext } from '../../hooks/use-review-sites-list-month-key';

interface ReviewSiteListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
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

    const months = eachMonthOfInterval({ start: startMonth, end: endMonth });

    const monthToSiteIdCounts = useMemo(() => {
        const map = new Map<string, Map<number, ReviewSiteSessionSummary>>();
        if (!getAllSessionsResult?.ok) return map;

        for (const session of getAllSessionsResult.data.sessions) {
            const monthKey = format(
                new Date(session.collectionDate),
                'yyyy-MM',
            );
            if (!map.has(monthKey)) map.set(monthKey, new Map());

            const monthMap = map.get(monthKey)!;
            const current = monthMap.get(session.siteId) ?? {
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
                sessionCount: current.sessionCount + 1,
                needsReviewCount:
                    current.needsReviewCount +
                    (session.state === 'NEEDS_REVIEW' ? 1 : 0),
                isLocked: current.isLocked && isLockedSessionState,
                isCertified: current.isCertified && isCertifiedSessionState,
                isSubmitted: current.isSubmitted && isSubmittedSessionState,
            });
        }

        return map;
    }, [getAllSessionsResult]);

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

    function toggleMonth(monthKey: string) {
        setCollapsedMonths(previousMonths => {
            const nextMonths = new Set(previousMonths);
            if (nextMonths.has(monthKey)) nextMonths.delete(monthKey);
            else nextMonths.add(monthKey);
            return nextMonths;
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

    return (
        <div className="space-y-2">
            {months.map(month => {
                const monthKey = format(month, 'yyyy-MM');
                const sessionCountsBySiteId =
                    monthToSiteIdCounts.get(monthKey) ??
                    new Map<number, ReviewSiteSessionSummary>();
                const isCollapsed = collapsedMonths.has(monthKey);

                return (
                    <Collapsible
                        key={monthKey}
                        open={!isCollapsed}
                        onOpenChange={() => toggleMonth(monthKey)}
                    >
                        <CollapsibleTrigger className="group flex w-full items-center gap-2 py-3">
                            <ChevronRight className="text-muted-foreground h-3.5 w-3.5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-90" />
                            <span className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
                                {format(month, 'MMMM yyyy')}
                            </span>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <ReviewSiteListMonthKeyContext.Provider
                                value={monthKey}
                            >
                                <ReviewSiteHierarchy
                                    sites={sites}
                                    parentPath={monthKey}
                                    sessionCountsBySiteId={
                                        sessionCountsBySiteId
                                    }
                                    expandedSitePaths={expandedSitePaths}
                                    onTogglePath={toggleSiteRow}
                                />
                            </ReviewSiteListMonthKeyContext.Provider>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
