import type { Session } from '@/api/session/validation/session-schema';
import {
    emptySessionSummary,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';

export function accumulateSessionSummary(
    existingSummary: ReviewSiteSessionSummary | undefined,
    session: Session,
): ReviewSiteSessionSummary {
    const base = existingSummary ?? emptySessionSummary();

    const state = session.state ?? 'NEEDS_REVIEW';
    return { ...base, [state]: base[state] + 1 };
}
