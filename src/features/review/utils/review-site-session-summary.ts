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
