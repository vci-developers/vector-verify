'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo, useState } from 'react';
import SiteHierarchy from '@/features/operations/components/site-list/operations-site-hierarchy';

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
        });

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

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return <h1>LOADING...</h1>;
    }

    if (!getAllSessionsResult.ok) {
        return <h1>ERROR: {getAllSessionsResult.error.message}</h1>;
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
