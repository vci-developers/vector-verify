import type { Session } from '@/api/session/validation/session-schema';
import { accumulateSessionSummary } from '@/features/review/utils/accumulate-session-summary';
import {
    emptySessionSummary,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';

export function getReviewUnitSessionSummary(
    sessions: Session[],
    siteId: number,
    collectionCycleId: number | null,
): ReviewSiteSessionSummary {
    return sessions
        .filter(
            session =>
                session.siteId === siteId &&
                session.collectionCycleId === collectionCycleId,
        )
        .reduce(
            (summary, session) => accumulateSessionSummary(summary, session),
            emptySessionSummary(),
        );
}
