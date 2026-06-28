import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { ReviewSiteSessionSummary } from '@/features/review-legacy/utils/review-site-session-summary';
import { accumulateSessionSummary } from '@/features/review-legacy/sites-list/utils/accumulate-session-summary';

export function buildCollectionCycleSegments(
    sessions: Session[],
    cycles: CollectionCycle[],
) {
    const segmentByCycleId = new Map<
        number,
        {
            cycle: CollectionCycle;
            sessionSummaryBySiteId: Map<number, ReviewSiteSessionSummary>;
        }
    >(
        cycles.map(
            cycle =>
                [
                    cycle.id,
                    { cycle, sessionSummaryBySiteId: new Map() },
                ] as const,
        ),
    );

    for (const session of sessions) {
        const { collectionCycleId } = session;
        if (collectionCycleId === null) continue;
        const cycleSegment = segmentByCycleId.get(collectionCycleId);
        if (cycleSegment === undefined) continue;
        cycleSegment.sessionSummaryBySiteId.set(
            session.siteId,
            accumulateSessionSummary(
                cycleSegment.sessionSummaryBySiteId.get(session.siteId),
                session,
            ),
        );
    }

    return cycles.map(cycle => segmentByCycleId.get(cycle.id)!);
}
