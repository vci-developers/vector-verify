'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { ChevronRight } from 'lucide-react';
import { createContext, useContext, useMemo, useState } from 'react';
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

const ReviewSiteListMonthKeyContext = createContext<string | null>(null);

export function useReviewSiteListMonthKey() {
    const monthKey = useContext(ReviewSiteListMonthKeyContext);
    if (monthKey === null) {
        throw new Error(
            'useReviewSiteListMonthKey must be used within a ReviewSitesList month.',
        );
    }
    return monthKey;
}

interface ReviewSiteListProps {
    sites: Site[];
    locationQueryParam: LocationQueryParam;
    startMonth: Date;
    endMonth: Date;
}

export default function ReviewSitesList({
    sites,
    locationQueryParam,
    startMonth,
    endMonth,
}: ReviewSiteListProps) {
    const [expandedSitePaths, setExpandedSitePaths] = useState<Set<string>>(
        new Set(),
    );
    const [collapsedMonths, setCollapsedMonths] = useState<Set<string>>(
        new Set(),
    );

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
        const map = new Map<
            string,
            Map<number, { sessionCount: number; needsReviewCount: number }>
        >();
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
            };
            monthMap.set(session.siteId, {
                sessionCount: current.sessionCount + 1,
                needsReviewCount:
                    current.needsReviewCount +
                    (session.state === 'NEEDS_REVIEW' ? 1 : 0),
            });
        }

        return map;
    }, [getAllSessionsResult]);

    function toggleSiteRow(path: string) {
        setExpandedSitePaths(previousPaths => {
            const nextPaths = new Set(previousPaths);
            if (nextPaths.has(path)) nextPaths.delete(path);
            else nextPaths.add(path);
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
                    monthToSiteIdCounts.get(monthKey) ?? new Map();
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
                                    depth={0}
                                    parentPath={monthKey}
                                    sessionCountsBySiteId={
                                        sessionCountsBySiteId
                                    }
                                    expandedSitePaths={expandedSitePaths}
                                    onToggle={toggleSiteRow}
                                />
                            </ReviewSiteListMonthKeyContext.Provider>
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
