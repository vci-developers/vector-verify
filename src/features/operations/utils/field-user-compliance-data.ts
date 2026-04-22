import type { Session } from '@/api/session/validation/session-schema';
import { format, isSameMonth, subMonths } from 'date-fns';

export interface CollectorRow {
    collectorTitle: string;
    collectorName: string;
    sessionCountsByMonth: Record<string, number>;
}

export interface FieldUserComplianceData {
    totalCollectors: number;
    activeCollectors: number;
    collectorRows: CollectorRow[];
}

export function buildCollectorKey(
    collectorTitle: string,
    collectorName: string,
): string {
    return `${collectorTitle}/${collectorName}`;
}

export function buildFieldUserComplianceData(
    sessions: Session[],
    monthKeys: string[],
): FieldUserComplianceData {
    const now = new Date();
    const previousMonth = subMonths(now, 1);

    const collectorMap = new Map<
        string,
        {
            collectorTitle: string;
            collectorName: string;
            sessionCountsByMonth: Record<string, number>;
            hasRecentSubmission: boolean;
        }
    >();

    for (const session of sessions) {
        const key = buildCollectorKey(
            session.collectorTitle,
            session.collectorName,
        );
        if (!collectorMap.has(key)) {
            collectorMap.set(key, {
                collectorTitle: session.collectorTitle,
                collectorName: session.collectorName,
                sessionCountsByMonth: Object.fromEntries(
                    monthKeys.map(month => [month, 0]),
                ),
                hasRecentSubmission: false,
            });
        }

        const entry = collectorMap.get(key)!;
        const submittedDate = new Date(session.submittedAt);
        const monthKey = format(submittedDate, 'yyyy-MM');

        if (monthKey in entry.sessionCountsByMonth) {
            entry.sessionCountsByMonth[monthKey] =
                (entry.sessionCountsByMonth[monthKey] ?? 0) + 1;
        }

        if (
            isSameMonth(submittedDate, now) ||
            isSameMonth(submittedDate, previousMonth)
        ) {
            entry.hasRecentSubmission = true;
        }
    }

    const collectors = [...collectorMap.values()].sort((a, b) =>
        a.collectorTitle.localeCompare(b.collectorTitle),
    );

    return {
        totalCollectors: collectors.length,
        activeCollectors: collectors.filter(c => c.hasRecentSubmission).length,
        collectorRows: collectors.map(
            ({ collectorTitle, collectorName, sessionCountsByMonth }) => ({
                collectorTitle,
                collectorName,
                sessionCountsByMonth,
            }),
        ),
    };
}
