'use client';

import type { Site } from '@/api/site/validation/site-schema';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import SiteHierarchy from '@/features/review/components/site-hierarchy';
import ExportSiteLeafRows from './export-site-leaf-rows';
import { isMonthFullySelected } from '@/features/review/export/utils/export-selection-helpers';
import type { Dhis2ExportSiteStatus } from '@/api/dhis2/validation/dhis2-sync-schema';

interface ExportSiteHierarchyProps {
    sites: Site[];
    parentPath: string;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
    certifiedCountsBySiteId: Map<number, number>;
    selectedSiteIds: Set<number>;
    onToggleSites: (siteIds: number[], select: boolean) => void;
    isExporting: boolean;
    exportStatusBySiteId: Map<number, Dhis2ExportSiteStatus>;
}

export default function ExportSiteHierarchy({
    sites,
    parentPath,
    expandedSitePaths,
    onTogglePath,
    certifiedCountsBySiteId,
    selectedSiteIds,
    onToggleSites,
    isExporting,
    exportStatusBySiteId,
}: ExportSiteHierarchyProps) {
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
                    certifiedCountsBySiteId={certifiedCountsBySiteId}
                    selectedSiteIds={selectedSiteIds}
                    onToggleSites={onToggleSites}
                    isExporting={isExporting}
                    exportStatusBySiteId={exportStatusBySiteId}
                />
            )}
            renderGroupContent={sitesInGroup => {
                const certifiedSitesInGroup = sitesInGroup.filter(
                    site =>
                        (certifiedCountsBySiteId.get(site.siteId) ?? 0) > 0,
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
                        <Checkbox
                            checked={isChecked}
                            disabled={isExporting}
                            onCheckedChange={() =>
                                onToggleSites([...certifiedSiteIds], !isChecked)
                            }
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
