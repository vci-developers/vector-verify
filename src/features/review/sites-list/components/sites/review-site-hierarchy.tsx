'use client';

import type { Site } from '@/api/site/validation/site-schema';
import SiteHierarchy from '@/features/review/components/site-hierarchy';
import ReviewVisitCoverageBadge from './review-visit-coverage-badge';
import ReviewSiteLeafRows from './review-site-leaf-rows';
import type { ReviewSiteSessionSummary } from '../../utils/review-site-session-summary';

function getVisitCoverageBackgroundColor(
    percentage: number,
    highThreshold = 80,
    mediumThreshold = 50,
): string {
    if (percentage >= highThreshold) return 'bg-success/10 hover:bg-success/20';
    if (percentage >= mediumThreshold)
        return 'bg-warning/10 hover:bg-warning/20';
    return 'bg-destructive/10 hover:bg-destructive/20';
}

interface ReviewSiteHierarchyProps {
    sites: Site[];
    parentPath: string;
    startDate: string;
    endDate: string;
    sessionCountsBySiteId: Map<number, ReviewSiteSessionSummary>;
    expandedSitePaths: Set<string>;
    onTogglePath: (path: string, descendantPaths: string[]) => void;
}

export default function ReviewSiteHierarchy({
    sites,
    parentPath,
    startDate,
    endDate,
    sessionCountsBySiteId,
    expandedSitePaths,
    onTogglePath,
}: ReviewSiteHierarchyProps) {
    return (
        <SiteHierarchy
            sites={sites}
            parentPath={parentPath}
            expandedSitePaths={expandedSitePaths}
            onTogglePath={onTogglePath}
            renderLeafRows={(leafSites, getDisplayName) => (
                <ReviewSiteLeafRows
                    sites={leafSites}
                    getDisplayName={getDisplayName}
                    sessionCountsBySiteId={sessionCountsBySiteId}
                    startDate={startDate}
                    endDate={endDate}
                />
            )}
            renderGroupContent={sitesInGroup => {
                const visitedCount = sitesInGroup.filter(
                    site =>
                        (sessionCountsBySiteId.get(site.siteId)?.sessionCount ??
                            0) > 0,
                ).length;
                const visitedPercentage =
                    sitesInGroup.length > 0
                        ? Math.round((visitedCount / sitesInGroup.length) * 100)
                        : 0;
                const needsReviewTotal = sitesInGroup.reduce(
                    (sum, site) =>
                        sum +
                        (sessionCountsBySiteId.get(site.siteId)
                            ?.needsReviewCount ?? 0),
                    0,
                );
                return {
                    headerClassName:
                        getVisitCoverageBackgroundColor(visitedPercentage),
                    summaryContent: (
                        <>
                            {needsReviewTotal > 0 && (
                                <span className="text-destructive text-xs tabular-nums">
                                    {`${needsReviewTotal} ${needsReviewTotal === 1 ? 'needs' : 'need'} review`}
                                </span>
                            )}
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {visitedCount} of {sitesInGroup.length} visited
                            </span>
                            <ReviewVisitCoverageBadge
                                visitedPercentage={visitedPercentage}
                            />
                        </>
                    ),
                };
            }}
        />
    );
}
