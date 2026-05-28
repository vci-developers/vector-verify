import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { ReviewSiteSessionSummary } from './review-site-session-summary';

export interface CollectionCycleSegment {
    cycle: CollectionCycle | null;
    sessionSummaryBySiteId: Map<number, ReviewSiteSessionSummary>;
}

function addSessionToSegment(
    segment: CollectionCycleSegment,
    session: Session,
) {
    const existing = segment.sessionSummaryBySiteId.get(session.siteId) ?? {
        sessionCount: 0,
        needsReviewCount: 0,
        isLocked: true,
        isCertified: true,
        isSubmitted: true,
    };

    segment.sessionSummaryBySiteId.set(session.siteId, {
        sessionCount: existing.sessionCount + 1,
        needsReviewCount:
            existing.needsReviewCount +
            (session.state === 'NEEDS_REVIEW' ? 1 : 0),
        isLocked:
            existing.isLocked &&
            (session.state === 'CERTIFIED' ||
                session.state === 'SUBMITTED' ||
                session.state === 'NOT_APPLICABLE'),
        isCertified: existing.isCertified && session.state === 'CERTIFIED',
        isSubmitted: existing.isSubmitted && session.state === 'SUBMITTED',
    });
}

export function buildCollectionCycleSegments(
    sessions: Session[],
    cycles: CollectionCycle[],
): CollectionCycleSegment[] {
    const segmentByCycleId = new Map<number | null, CollectionCycleSegment>([
        ...cycles.map(
            cycle =>
                [
                    cycle.id,
                    { cycle, sessionSummaryBySiteId: new Map() },
                ] as const,
        ),
        [null, { cycle: null, sessionSummaryBySiteId: new Map() }],
    ]);

    for (const session of sessions) {
        const cycleSegment = segmentByCycleId.get(session.collectionCycleId);
        if (cycleSegment) addSessionToSegment(cycleSegment, session);
    }

    const assignedSegments = cycles.map(
        cycle => segmentByCycleId.get(cycle.id)!,
    );
    const unassignedSegment = segmentByCycleId.get(null)!;
    if (unassignedSegment.sessionSummaryBySiteId.size > 0)
        assignedSegments.push(unassignedSegment);
    return assignedSegments;
}
