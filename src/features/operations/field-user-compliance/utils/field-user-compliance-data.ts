import type { Session } from '@/api/session/validation/session-schema';
import { format, isSameMonth, subMonths } from 'date-fns';

export interface CollectorRow {
    collectorTitle: string;
    collectorName: string;
    locationLabel: string;
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
    siteIdToLocationLabel: Map<number, string>,
): FieldUserComplianceData {
    const now = new Date();
    const previousMonth = subMonths(now, 1);

    const collectorMap = new Map<
        string,
        {
            collectorTitle: string;
            collectorName: string;
            locationLabel: string;
            sessionCountsByMonth: Record<string, number>;
            hasRecentSubmission: boolean;
        }
    >();

    for (const session of sessions) {
        const collectorName = session.collectorName.trim();
        const collectorTitle = session.collectorTitle.trim();
        const locationLabel = siteIdToLocationLabel.get(session.siteId) ?? '';
        const collectorKey = `${locationLabel}/${collectorName}/${collectorTitle}`;
        if (!collectorMap.has(collectorKey)) {
            collectorMap.set(collectorKey, {
                collectorTitle,
                collectorName,
                locationLabel,
                sessionCountsByMonth: Object.fromEntries(
                    monthYearKeys.map(month => [month, 0]),
                ),
                hasRecentSubmission: false,
            });
        }

        const entry = collectorMap.get(collectorKey)!;
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
    const collectors = [...collectorMap.values()].sort(
        (a, b) =>
            a.locationLabel.localeCompare(b.locationLabel) ||
            a.collectorTitle.localeCompare(b.collectorTitle),
    );

    return {
        totalCollectors: collectors.length,
        activeCollectors: collectors.filter(c => c.hasRecentSubmission).length,
        collectorRows: collectors.map(
            ({
                collectorTitle,
                collectorName,
                locationLabel,
                sessionCountsByMonth,
            }) => ({
                collectorTitle,
                collectorName,
                locationLabel,
                sessionCountsByMonth,
            }),
        ),
    };
}
