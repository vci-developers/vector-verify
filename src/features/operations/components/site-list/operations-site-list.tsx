'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo, useState } from 'react';
import { Microscope } from 'lucide-react';
import SiteHierarchy from './operations-site-hierarchy';
import { Skeleton } from '@/components/ui/skeleton';

const DEFAULT_SKELETON_COUNT = 5;

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
        useGetAllSessions(
            {
                district,
                ...(startDate && { startDate }),
                ...(endDate && { endDate }),
            },
            { enabled: !!district },
        );

    const siteIdToSessionCounts = useMemo(() => {
        const counts = new Map<number, number>();
        if (!getAllSessionsResult?.ok) return counts;

        for (const session of getAllSessionsResult.data.sessions) {
            counts.set(session.siteId, (counts.get(session.siteId) ?? 0) + 1);
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

    const skeletonCount =
        sites.length > 0
            ? new Set(sites.map(s => s.subCounty)).size
            : DEFAULT_SKELETON_COUNT;

    if (!district || isGetAllSessionsPending || !getAllSessionsResult) {
        return (
            <div className="relative">
                <div className="space-y-1">
                    {Array.from({ length: skeletonCount }).map((_, i) => (
                        <div
                            key={i}
                            className="flex items-center justify-between rounded-lg"
                        >
                            <Skeleton height="xl" width="full" />
                        </div>
                    ))}
                </div>
                {!district && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                        <Microscope className="text-muted-foreground/50 mb-4 h-12 w-12" />
                        <p className="text-muted-foreground text-sm">
                            Select a district to view sites.
                        </p>
                    </div>
                )}
            </div>
        );
    }

    if (!getAllSessionsResult.ok) {
        return (
            <div className="space-y-1">
                {Array.from({ length: skeletonCount }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center justify-between rounded-lg"
                    >
                        <Skeleton
                            height="xl"
                            width="full"
                            variant="destructive"
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
        <SiteHierarchy
            sites={sites}
            depth={0}
            parentPath=""
            siteIdToSessionCounts={siteIdToSessionCounts}
            expandedSitePaths={expandedSitePaths}
            onToggle={toggleSiteRow}
        />
    );
}
