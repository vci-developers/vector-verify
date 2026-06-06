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

export function isSiteFullyReviewed(
    summary: ReviewSiteSessionSummary,
): boolean {
    return (
        getSiteSessionCount(summary) > 0 &&
        summary.NEEDS_REVIEW === 0 &&
        summary.IN_REVIEW === 0
    );
}

export function isSiteFullyCertified(
    summary: ReviewSiteSessionSummary,
): boolean {
    const total = getSiteSessionCount(summary);
    return total > 0 && summary.CERTIFIED === total;
}

export function isSiteFullySubmittedToDhis2(
    summary: ReviewSiteSessionSummary,
): boolean {
    const total = getSiteSessionCount(summary);
    return total > 0 && summary.SUBMITTED === total;
}

export function siteHasCertifiedOrSubmittedSessions(
    summary: ReviewSiteSessionSummary,
): boolean {
    return summary.CERTIFIED + summary.SUBMITTED > 0;
}
