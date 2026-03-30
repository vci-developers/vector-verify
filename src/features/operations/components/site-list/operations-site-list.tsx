'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import type { Site } from '@/api/site/validation/site-schema';
import { useMemo, useState } from 'react';
import { Microscope } from 'lucide-react';
import SiteHierarchy, { getHierarchyLevels } from './operations-site-hierarchy';

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

    const hierarchyLevels = useMemo(() => getHierarchyLevels(sites), [sites]);

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

    if (!district) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <p className="text-muted-foreground text-sm">
                    Please select a district to view sites.
                </p>
                <Microscope className="text-muted-foreground/50 mt-4 h-12 w-12" />
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
            hierarchyLevels={hierarchyLevels}
        />
    );
}
