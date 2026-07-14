import {
    getSiteOverallReviewState,
    type ReviewState,
} from '@/features/review/utils/review-site-session-summary';
import type { ReviewSegment } from '@/features/review/sites-list/utils/build-review-segments';

export function filterSegmentByReviewState(
    segment: ReviewSegment,
    selectedReviewStates: ReviewState[],
): Set<number> {
    const isStateSelected = (state: ReviewState) =>
        selectedReviewStates.length === 0 ||
        selectedReviewStates.includes(state);

    const visibleSiteIds = new Set<number>();

    for (const [siteId, summary] of segment.summaryBySiteId) {
        const overallState = getSiteOverallReviewState(summary);
        if (overallState !== null && isStateSelected(overallState)) {
            visibleSiteIds.add(siteId);
        }
    }

    return visibleSiteIds;
}
