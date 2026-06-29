import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { ReviewSiteSessionSummary } from '@/features/review/utils/review-site-session-summary';
import { accumulateSessionSummary } from '@/features/review/sites-list/utils/accumulate-session-summary';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import {
    eachMonthOfInterval,
    endOfMonth,
    format,
    startOfMonth,
} from 'date-fns';

export type ReviewSegment = {
    key: string;
    startDate: string;
    endDate: string;
    collectionCycleId?: number;
    timezone?: string | null;
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>;
} & (
    | { kind: 'cycle'; cycleNumber: number }
    | { kind: 'month' }
    | { kind: 'unassigned' }
);

function addSessionToSummary(
    summaryBySiteId: Map<number, ReviewSiteSessionSummary>,
    session: Session,
) {
    summaryBySiteId.set(
        session.siteId,
        accumulateSessionSummary(summaryBySiteId.get(session.siteId), session),
    );
}

export function buildReviewSegments({
    sessions,
    collectionCycles,
    selectedCycleIds,
    startMonth,
    endMonth,
}: {
    sessions: Session[];
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    startMonth: Date;
    endMonth: Date;
}): ReviewSegment[] {
    if (collectionCycles.length > 0) {
        return buildCycleSegments(
            sessions,
            collectionCycles,
            selectedCycleIds,
            startMonth,
            endMonth,
        );
    }
    return buildMonthSegments(sessions, startMonth, endMonth);
}

function buildCycleSegments(
    sessions: Session[],
    collectionCycles: CollectionCycle[],
    selectedCycleIds: number[],
    startMonth: Date,
    endMonth: Date,
): ReviewSegment[] {
    const summaryBySiteIdByCycleId = new Map<
        number,
        Map<number, ReviewSiteSessionSummary>
    >(
        collectionCycles.map(
            cycle =>
                [
                    cycle.id,
                    new Map<number, ReviewSiteSessionSummary>(),
                ] as const,
        ),
    );
    const unassignedSummaryBySiteId = new Map<
        number,
        ReviewSiteSessionSummary
    >();

    for (const session of sessions) {
        const targetSummaryBySiteId =
            session.collectionCycleId === null
                ? unassignedSummaryBySiteId
                : summaryBySiteIdByCycleId.get(session.collectionCycleId);

        if (targetSummaryBySiteId === undefined) continue;
        addSessionToSummary(targetSummaryBySiteId, session);
    }

    const isCycleListed = (cycleId: number) =>
        selectedCycleIds.length === 0 || selectedCycleIds.includes(cycleId);

    const segments: ReviewSegment[] = collectionCycles
        .filter(cycle => isCycleListed(cycle.id))
        .map(
            (cycle): ReviewSegment => ({
                kind: 'cycle',
                key: `cycle-${cycle.id}`,
                cycleNumber: cycle.cycleNumber,
                startDate: formatDateInTimezone(
                    cycle.startDate,
                    cycle.timezone,
                    'yyyy-MM-dd',
                ),
                endDate: formatDateInTimezone(
                    cycle.endDate,
                    cycle.timezone,
                    'yyyy-MM-dd',
                ),
                collectionCycleId: cycle.id,
                timezone: cycle.timezone,
                summaryBySiteId: summaryBySiteIdByCycleId.get(cycle.id)!,
            }),
        );

    if (selectedCycleIds.length === 0 && unassignedSummaryBySiteId.size > 0) {
        segments.push({
            kind: 'unassigned',
            key: 'unassigned',
            startDate: format(startOfMonth(startMonth), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(endMonth), 'yyyy-MM-dd'),
            summaryBySiteId: unassignedSummaryBySiteId,
        });
    }

    return segments;
}

function buildMonthSegments(
    sessions: Session[],
    startMonth: Date,
    endMonth: Date,
): ReviewSegment[] {
    const summaryBySiteIdByMonthKey = new Map<
        string,
        Map<number, ReviewSiteSessionSummary>
    >();

    for (const session of sessions) {
        const monthKey = formatDateInTimezone(
            session.collectionDate,
            'UTC',
            'yyyy-MM',
        );
        let monthSummaryBySiteId = summaryBySiteIdByMonthKey.get(monthKey);
        if (monthSummaryBySiteId === undefined) {
            monthSummaryBySiteId = new Map();
            summaryBySiteIdByMonthKey.set(monthKey, monthSummaryBySiteId);
        }
        addSessionToSummary(monthSummaryBySiteId, session);
    }

    return eachMonthOfInterval({ start: startMonth, end: endMonth }).map(
        (month): ReviewSegment => {
            const monthKey = format(month, 'yyyy-MM');
            return {
                kind: 'month',
                key: `month-${monthKey}`,
                startDate: format(month, 'yyyy-MM-dd'),
                endDate: format(endOfMonth(month), 'yyyy-MM-dd'),
                summaryBySiteId:
                    summaryBySiteIdByMonthKey.get(monthKey) ?? new Map(),
            };
        },
    );
}
