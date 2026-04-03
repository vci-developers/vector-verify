'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { useState } from 'react';
import OperationsSiteHierarchy from '../site-list/operations-site-hierarchy';

interface OperationsHousesTabProps {
    sites: Site[];
    siteIdToSessionCounts: Map<number, number>;
}

export default function OperationsHousesTab({
    sites,
    siteIdToSessionCounts,
}: OperationsHousesTabProps) {
    const [expandedSitePaths, setExpandedSitePaths] = useState<Set<string>>(
        new Set(),
    );

    function toggleSiteRow(path: string) {
        setExpandedSitePaths(previousExpandedSitePaths => {
            const nextExpandedSitePaths = new Set(previousExpandedSitePaths);

            if (nextExpandedSitePaths.has(path)) {
                nextExpandedSitePaths.delete(path);
            } else {
                nextExpandedSitePaths.add(path);
            }

            return nextExpandedSitePaths;
        });
    }

    return (
        <OperationsSiteHierarchy
            sites={sites}
            depth={0}
            parentPath=""
            siteIdToSessionCounts={siteIdToSessionCounts}
            expandedSitePaths={expandedSitePaths}
            onToggle={toggleSiteRow}
        />
    );
}
