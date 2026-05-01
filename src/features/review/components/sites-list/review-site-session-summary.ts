import type { SessionState } from '@/api/session/validation/session-schema';

export interface ReviewSiteSessionSummary {
    sessionCount: number;
    needsReviewCount: number;
    stateCounts: Partial<Record<SessionState, number>>;
}

export const LOCKED_SESSION_STATES = [
    'CERTIFIED',
    'SUBMITTED',
    'NOT_APPLICABLE',
] as const satisfies readonly SessionState[];

export function isReviewSiteLocked(
    summary: ReviewSiteSessionSummary | undefined,
): boolean {
    if (!summary || summary.sessionCount === 0) return true;

    const lockedSessionCount = LOCKED_SESSION_STATES.reduce(
        (total, state) => total + (summary.stateCounts[state] ?? 0),
        0,
    );

    return lockedSessionCount === summary.sessionCount;
}

export function getReviewSiteStatus(
    summary: ReviewSiteSessionSummary,
): SessionState | 'LOCKED' | undefined {
    for (const state of LOCKED_SESSION_STATES) {
        if ((summary.stateCounts[state] ?? 0) === summary.sessionCount) {
            return state;
        }
    }

    const lockedSessionCount = LOCKED_SESSION_STATES.reduce(
        (total, state) => total + (summary.stateCounts[state] ?? 0),
        0,
    );

    if (lockedSessionCount === summary.sessionCount) return 'LOCKED';
    if (summary.needsReviewCount > 0) return 'NEEDS_REVIEW';
    if ((summary.stateCounts.IN_REVIEW ?? 0) > 0) return 'IN_REVIEW';

    return undefined;
}
