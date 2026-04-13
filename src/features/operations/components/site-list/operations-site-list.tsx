'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo, useState } from 'react';
import SiteHierarchy from './operations-site-hierarchy';
import { SkeletonList } from '@/components/ui/skeleton-list';

interface OperationsSiteListProps {
    sites: Site[];
    district: string;
    startDate?: string;
    endDate?: string;
}

export default function OperationsSiteList({
    sites,
    district,
    startDate,
    endDate,
}: OperationsSiteListProps) {
    const [expandedSitePaths, setExpandedSitePaths] = useState<Set<string>>(
        new Set(),
    );

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            district,
            ...(startDate && { startDate }),
            ...(endDate && { endDate }),
            type: 'SURVEILLANCE',
        });

    const siteIdToCounts = useMemo(() => {
        const counts = new Map<
            number,
            { sessionCount: number; needsReviewCount: number }
        >();
        if (!getAllSessionsResult?.ok) return counts;

        for (const session of getAllSessionsResult.data.sessions) {
            const currentCounts = counts.get(session.siteId) ?? {
                sessionCount: 0,
                needsReviewCount: 0,
            };
            counts.set(session.siteId, {
                sessionCount: currentCounts.sessionCount + 1,
                needsReviewCount:
                    currentCounts.needsReviewCount +
                    (session.state === 'NEEDS_REVIEW' ? 1 : 0),
            });
        }
        return counts;
    }, [getAllSessionsResult]);

    function toggleSiteRow(path: string) {
        setExpandedSitePaths(previousExpandedSitePaths => {
            const nextExpandedSitePaths = new Set(previousExpandedSitePaths);
            if (nextExpandedSitePaths.has(path))
                nextExpandedSitePaths.delete(path);
            else nextExpandedSitePaths.add(path);
            return nextExpandedSitePaths;
        });
    }

    const skeletonCount = new Set(sites.map(s => s.subCounty)).size || 5;

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <SkeletonList count={skeletonCount} height="xl" width="full" />;
    }

    if (!getAllSessionsResult.ok) {
        return (
            <SkeletonList
                count={skeletonCount}
                height="xl"
                width="full"
                variant="destructive"
            />
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
        <SiteHierarchy
            sites={sites}
            depth={0}
            parentPath=""
            siteIdToCounts={siteIdToCounts}
            expandedSitePaths={expandedSitePaths}
            onToggle={toggleSiteRow}
        />
    );
}
