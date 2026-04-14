'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import {
    eachMonthOfInterval,
    endOfMonth,
    format,
} from 'date-fns';
import { useMemo, useState } from 'react';
import SiteHierarchy from './operations-site-hierarchy';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { ChevronRight } from 'lucide-react';

interface OperationsSiteListProps {
    sites: Site[];
    district: string;
    startMonth: Date;
    endMonth: Date;
}

export default function OperationsSiteList({
    sites,
    district,
    startMonth,
    endMonth,
}: OperationsSiteListProps) {
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
            district,
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

    if (
        isGetAllSessionsPending ||
        !getAllSessionsResult ||
        !getAllSessionsResult.ok
    ) {
        const variant =
            getAllSessionsResult?.ok === false ? 'destructive' : 'default';
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
                            variant={variant}
                        />
                    </div>
                ))}
            </div>
        );
    }

    if (sites.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    No sites found for this district.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            {months.map(month => {
                const monthKey = format(month, 'yyyy-MM');
                const siteIdToCounts =
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
                            <SiteHierarchy
                                sites={sites}
                                depth={0}
                                parentPath={monthKey}
                                siteIdToCounts={siteIdToCounts}
                                expandedSitePaths={expandedSitePaths}
                                onToggle={toggleSiteRow}
                            />
                        </CollapsibleContent>
                    </Collapsible>
                );
            })}
        </div>
    );
}
