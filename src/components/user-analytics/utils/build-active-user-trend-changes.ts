import { subDays, format, parseISO } from 'date-fns';
import type { ActiveMetricSnapshot } from '@/api/user/validation/active-metric-snapshot-schema';

export interface ActiveUserPeriodTrend {
    count: number;
    priorCount: number | null;
    window: { start: string; end: string };
    priorWindow: { start: string; end: string } | null;
    sparklineValues: number[];
}

export interface ActiveUserTrendSummary {
    daily: ActiveUserPeriodTrend;
    weekly: ActiveUserPeriodTrend;
    monthly: ActiveUserPeriodTrend;
    snapshotUpdatedAt: string;
}

const dateKey = (date: string | Date): string =>
    format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');

function windowDateRange(
    windowEnd: Date,
    windowLengthDays: number,
): { start: string; end: string } {
    return {
        start: format(subDays(windowEnd, windowLengthDays - 1), 'MMM d'),
        end: format(windowEnd, 'MMM d'),
    };
}

const SPARKLINE_TRAILING_DAYS = 14;

function sparklineValues(
    snapshotsByDate: Map<string, ActiveMetricSnapshot>,
    windowEnd: Date,
    metricKey: 'a1Count' | 'a7Count' | 'a30Count',
): number[] {
    const values: number[] = [];
    for (let daysAgo = SPARKLINE_TRAILING_DAYS - 1; daysAgo >= 0; daysAgo--) {
        const snapshot = snapshotsByDate.get(
            dateKey(subDays(windowEnd, daysAgo)),
        );
        if (snapshot) values.push(snapshot[metricKey]);
    }
    return values;
}

function priorWindowDateRange(
    priorSnapshot: ActiveMetricSnapshot | undefined,
    windowLengthDays: number,
): { start: string; end: string } | null {
    if (!priorSnapshot) return null;
    return windowDateRange(
        parseISO(priorSnapshot.snapshotDate),
        windowLengthDays,
    );
}

export function buildActiveUserTrendChanges(
    snapshots: ActiveMetricSnapshot[],
): ActiveUserTrendSummary | null {
    if (snapshots.length === 0) return null;

    const snapshotsByDate = new Map(
        snapshots.map(snapshot => [dateKey(snapshot.snapshotDate), snapshot]),
    );

    const latestSnapshot = snapshots.reduce((latest, snapshot) =>
        parseISO(snapshot.snapshotDate) > parseISO(latest.snapshotDate)
            ? snapshot
            : latest,
    );
    const latestDate = parseISO(latestSnapshot.snapshotDate);

    const priorDaySnapshot = snapshotsByDate.get(
        dateKey(subDays(latestDate, 1)),
    );
    const priorWeekSnapshot = snapshotsByDate.get(
        dateKey(subDays(latestDate, 7)),
    );
    const priorMonthSnapshot = snapshotsByDate.get(
        dateKey(subDays(latestDate, 30)),
    );

    return {
        daily: {
            count: latestSnapshot.a1Count,
            priorCount: priorDaySnapshot?.a1Count ?? null,
            window: windowDateRange(latestDate, 1),
            priorWindow: priorWindowDateRange(priorDaySnapshot, 1),
            sparklineValues: sparklineValues(
                snapshotsByDate,
                latestDate,
                'a1Count',
            ),
        },
        weekly: {
            count: latestSnapshot.a7Count,
            priorCount: priorWeekSnapshot?.a7Count ?? null,
            window: windowDateRange(latestDate, 7),
            priorWindow: priorWindowDateRange(priorWeekSnapshot, 7),
            sparklineValues: sparklineValues(
                snapshotsByDate,
                latestDate,
                'a7Count',
            ),
        },
        monthly: {
            count: latestSnapshot.a30Count,
            priorCount: priorMonthSnapshot?.a30Count ?? null,
            window: windowDateRange(latestDate, 30),
            priorWindow: priorWindowDateRange(priorMonthSnapshot, 30),
            sparklineValues: sparklineValues(
                snapshotsByDate,
                latestDate,
                'a30Count',
            ),
        },
        snapshotUpdatedAt: latestSnapshot.updatedAt,
    };
}
