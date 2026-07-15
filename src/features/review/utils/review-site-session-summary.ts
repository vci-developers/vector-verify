import {
    sessionStateSchema,
    type SessionState,
} from '@/api/session/validation/session-schema';

export type ReviewSiteSessionSummary = Record<SessionState, number>;

export function emptySessionSummary(): ReviewSiteSessionSummary {
    return Object.fromEntries(
        sessionStateSchema.options.map(state => [state, 0] as const),
    ) as ReviewSiteSessionSummary;
}

export function getSiteSessionCount(summary: ReviewSiteSessionSummary): number {
    return Object.values(summary).reduce((total, count) => total + count, 0);
}

export const REVIEW_STATE_SEVERITY_ORDER = [
    'NEEDS_REVIEW',
    'IN_REVIEW',
    'CERTIFIED',
    'SUBMITTED',
] as const satisfies readonly SessionState[];

export type ReviewState = (typeof REVIEW_STATE_SEVERITY_ORDER)[number];

export function getSiteOverallReviewState(
    summary: ReviewSiteSessionSummary,
): (typeof REVIEW_STATE_SEVERITY_ORDER)[number] | null {
    return (
        REVIEW_STATE_SEVERITY_ORDER.find(state => summary[state] > 0) ?? null
    );
}

export function isSiteFullyReviewed(
    summary: ReviewSiteSessionSummary,
): boolean {
    const overallReviewState = getSiteOverallReviewState(summary);
    return (
        overallReviewState === 'CERTIFIED' || overallReviewState === 'SUBMITTED'
    );
}

export function isSiteFullySubmittedToDhis2(
    summary: ReviewSiteSessionSummary,
): boolean {
    const total = getSiteSessionCount(summary);
    return total > 0 && summary.SUBMITTED === total;
}
