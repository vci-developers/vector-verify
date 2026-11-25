import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { eachMonthOfInterval, endOfMonth, format } from 'date-fns';

export type ReportingSegment = {
    key: string;
    startDate: string;
    endDate: string;
    timezone: string | null;
    sessionsBySiteId: Map<number, Session[]>;
} & ({ kind: 'cycle'; cycleNumber: number } | { kind: 'month' });

function groupSessionsBySiteId(sessions: Session[]): Map<number, Session[]> {
    const sessionsBySiteId = new Map<number, Session[]>();
    for (const session of sessions) {
        const siteSessions = sessionsBySiteId.get(session.siteId) ?? [];
        siteSessions.push(session);
        sessionsBySiteId.set(session.siteId, siteSessions);
    }
    return sessionsBySiteId;
}

export function buildReportingSegments({
    sessions,
    collectionCycles,
    startMonth,
    endMonth,
}: {
    sessions: Session[];
    collectionCycles: CollectionCycle[];
    startMonth: Date;
    endMonth: Date;
}): ReportingSegment[] {
    if (collectionCycles.length > 0) {
        return [...collectionCycles]
            .sort(
                (firstCycle, secondCycle) =>
                    firstCycle.startDate - secondCycle.startDate,
            )
            .map(cycle => ({
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
                timezone: cycle.timezone,
                sessionsBySiteId: groupSessionsBySiteId(
                    sessions.filter(
                        session => session.collectionCycleId === cycle.id,
                    ),
                ),
            }));
    }
    return eachMonthOfInterval({ start: startMonth, end: endMonth }).map(
        month => {
            const monthKey = format(month, 'yyyy-MM');
            return {
                kind: 'month',
                key: `month-${monthKey}`,
                startDate: format(month, 'yyyy-MM-dd'),
                endDate: format(endOfMonth(month), 'yyyy-MM-dd'),
                timezone: null,
                sessionsBySiteId: groupSessionsBySiteId(
                    sessions.filter(
                        session =>
                            formatDateInTimezone(
                                session.collectionDate,
                                'UTC',
                                'yyyy-MM',
                            ) === monthKey,
                    ),
                ),
            };
        },
    );
}
