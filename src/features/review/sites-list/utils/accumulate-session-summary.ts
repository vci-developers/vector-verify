import type { Session } from '@/api/session/validation/session-schema';
import type { ReviewSiteSessionSummary } from '@/features/review/sites-list/utils/review-site-session-summary';

export function accumulateSessionSummary(
    existing: ReviewSiteSessionSummary | undefined,
    session: Session,
): ReviewSiteSessionSummary {
    const base = existing ?? {
        sessionCount: 0,
        needsReviewCount: 0,
        isLocked: true,
        isCertified: true,
        isSubmitted: true,
    };

    return {
        sessionCount: base.sessionCount + 1,
        needsReviewCount:
            base.needsReviewCount + (session.state === 'NEEDS_REVIEW' ? 1 : 0),
        isLocked:
            base.isLocked &&
            (session.state === 'CERTIFIED' ||
                session.state === 'SUBMITTED' ||
                session.state === 'NOT_APPLICABLE'),
        isCertified: base.isCertified && session.state === 'CERTIFIED',
        isSubmitted: base.isSubmitted && session.state === 'SUBMITTED',
    };
}
