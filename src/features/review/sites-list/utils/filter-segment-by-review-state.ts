import { getSiteOverallReviewState } from '@/features/review/utils/review-site-session-summary';
import type { SessionState } from '@/api/session/validation/session-schema';
import type { ReviewSegment } from '@/features/review/sites-list/utils/build-review-segments';

export function filterSegmentByReviewState(
    segment: ReviewSegment,
    selectedReviewStates: SessionState[],
): Set<number> {
    const selectedStateSet = new Set(selectedReviewStates);
    const visibleSiteIds = new Set<number>();

    for (const [siteId, summary] of segment.summaryBySiteId) {
        const overallState = getSiteOverallReviewState(summary);
        if (overallState !== null && selectedStateSet.has(overallState)) {
            visibleSiteIds.add(siteId);
        }
    }
    return visibleSiteIds;
}
