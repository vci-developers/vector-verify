import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { ReviewSiteSessionSummary } from '@/features/review/sites-list/utils/review-site-session-summary';
import { accumulateSessionSummary } from '@/features/review/sites-list/utils/accumulate-session-summary';

export function buildCollectionCycleSegments(
    sessions: Session[],
    cycles: CollectionCycle[],
) {
    const segmentByCycleId = new Map<
        number | null,
        {
            cycle: CollectionCycle | null;
            sessionSummaryBySiteId: Map<number, ReviewSiteSessionSummary>;
        }
    >([
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
        const { collectionCycleId } = session;
        const resolvedCycleId =
            collectionCycleId !== null &&
            segmentByCycleId.has(collectionCycleId)
                ? collectionCycleId
                : null;
        const cycleSegment = segmentByCycleId.get(resolvedCycleId)!;
        cycleSegment.sessionSummaryBySiteId.set(
            session.siteId,
            accumulateSessionSummary(
                cycleSegment.sessionSummaryBySiteId.get(session.siteId),
                session,
            ),
        );
    }

    const assignedSegments = cycles.map(
        cycle => segmentByCycleId.get(cycle.id)!,
    );
    const unassignedSegment = segmentByCycleId.get(null)!;
    if (unassignedSegment.sessionSummaryBySiteId.size > 0)
        assignedSegments.push(unassignedSegment);
    return assignedSegments;
}
