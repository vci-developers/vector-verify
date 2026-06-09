import type { Session } from '@/api/session/validation/session-schema';
import { toUTCMonthKey } from '@/lib/date/utc-month-key';
import { subMonths } from 'date-fns';

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

export function buildFieldUserComplianceData(
    sessions: Session[],
    monthYearKeys: string[],
): FieldUserComplianceData {
    const now = new Date();
    const previousMonth = subMonths(now, 1);
    const currentMonthKey = toUTCMonthKey(now);
    const previousMonthKey = toUTCMonthKey(previousMonth);

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
        const collectorName = session.collectorName.trim();
        const collectorTitle = session.collectorTitle.trim();
        const collectorKey = `${collectorName}/${collectorTitle}`;
        if (!collectorMap.has(collectorKey)) {
            collectorMap.set(collectorKey, {
                collectorTitle,
                collectorName,
                sessionCountsByMonth: Object.fromEntries(
                    monthYearKeys.map(month => [month, 0]),
                ),
                hasRecentSubmission: false,
            });
        }

        const entry = collectorMap.get(collectorKey)!;
        const submittedDate = new Date(session.submittedAt);
        const monthKey = toUTCMonthKey(submittedDate);

        if (monthKey in entry.sessionCountsByMonth) {
            entry.sessionCountsByMonth[monthKey] =
                (entry.sessionCountsByMonth[monthKey] ?? 0) + 1;
        }

        if (monthKey === currentMonthKey || monthKey === previousMonthKey) {
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
