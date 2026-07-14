import {
    getSiteOverallReviewState,
    type REVIEW_STATE_SEVERITY_ORDER,
} from '@/features/review/utils/review-site-session-summary';
import type { ReviewSegment } from '@/features/review/sites-list/utils/build-review-segments';

export type ReviewState = (typeof REVIEW_STATE_SEVERITY_ORDER)[number];

export const REVIEW_STATE_LABEL_KEY: Record<ReviewState, string> = {
    NEEDS_REVIEW: 'needsReview',
    IN_REVIEW: 'inReview',
    CERTIFIED: 'certified',
    SUBMITTED: 'submitted',
};

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
