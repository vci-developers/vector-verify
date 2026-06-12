'use client';

import type { Site } from '@/api/site/validation/site-schema';
import SiteHierarchy from '@/features/review/components/site-hierarchy';
import ReviewVisitCoverageBadge from '@/features/review/sites-list/components/sites/review-visit-coverage-badge';
import ReviewSiteLeafRows from '@/features/review/sites-list/components/sites/review-site-leaf-rows';
import type { ReviewSiteSessionSummary } from '@/features/review/sites-list/utils/review-site-session-summary';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react/jsx-runtime';

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
    const t = useTranslations('ReviewSitesList');
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
                const needsReviewSiteCount = sitesInGroup.filter(
                    site =>
                        (sessionCountsBySiteId.get(site.siteId)
                            ?.needsReviewCount ?? 0) > 0,
                ).length;
                return {
                    headerClassName:
                        getVisitCoverageBackgroundColor(visitedPercentage),
                    summaryContent: (
                        <Fragment>
                            {needsReviewSiteCount > 0 && (
                                <span className="text-destructive text-xs tabular-nums">
                                    {t('sitesNeedReview', {
                                        count: needsReviewSiteCount,
                                    })}
                                </span>
                            )}
                            <span className="text-muted-foreground text-xs tabular-nums">
                                {visitedCount} of {sitesInGroup.length} visited
                            </span>
                            <ReviewVisitCoverageBadge
                                visitedPercentage={visitedPercentage}
                            />
                        </Fragment>
                    ),
                };
            }}
        />
    );
}
