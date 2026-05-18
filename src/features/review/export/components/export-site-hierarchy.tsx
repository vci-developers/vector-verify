'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/utils/cn';
import SiteHierarchy from '@/features/review/shared/site-hierarchy';
import ExportSiteLeafRows from './export-site-leaf-rows';
import { useExportMonthContext } from './export-month-row';
import {
    hasCertifiedSessions,
    isMonthFullySelected,
} from '@/features/review/export/utils/export-selection-helpers';

interface ExportSiteHierarchyProps {
    sites: Site[];
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
}

export default function ExportSiteHierarchy({
    sites,
    parentPath,
    expandedSitePaths,
    onTogglePath,
}: ExportSiteHierarchyProps) {
    const {
        certifiedCountsBySiteId,
        selectedSiteIds,
        onToggleSites,
        isExporting,
    } = useExportMonthContext();

    return (
        <SiteHierarchy
            sites={sites}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
            renderLeafRows={(leafSites, getDisplayName) => (
                <ExportSiteLeafRows
                    sites={leafSites}
                    getDisplayName={getDisplayName}
                />
            )}
            renderGroupContent={sitesInGroup => {
                const certifiedSitesInGroup = sitesInGroup.filter(site =>
                    hasCertifiedSessions(site, certifiedCountsBySiteId),
                );
                if (certifiedSitesInGroup.length === 0) return null;

                const certifiedSiteIds = new Set(
                    certifiedSitesInGroup.map(site => site.siteId),
                );
                const isChecked = isMonthFullySelected(
                    certifiedSiteIds,
                    selectedSiteIds,
                );

                return {
                    prefixContent: (
                        <input
                            type="checkbox"
                            checked={isChecked}
                            disabled={isExporting}
                            onChange={() =>
                                onToggleSites([...certifiedSiteIds], !isChecked)
                            }
                            onClick={event => event.stopPropagation()}
                            className={cn(
                                'h-4 w-4',
                                isExporting
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer',
                            )}
                        />
                    ),
                    summaryContent: (
                        <Badge variant="default" className="text-xs">
                            {certifiedSitesInGroup.length} certified
                        </Badge>
                    ),
                };
            }}
        />
    );
}
