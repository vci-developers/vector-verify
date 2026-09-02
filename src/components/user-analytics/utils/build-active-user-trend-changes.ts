import { subDays, format, parseISO } from 'date-fns';
import type { ActiveMetricSnapshot } from '@/api/user/validation/active-metric-snapshot-schema';

export interface ActiveUserTrendChange {
    count: number;
    percentChange: number | null;
    isNewFromZero: boolean;
}

export interface ActiveUserTrendChanges {
    daily: ActiveUserTrendChange;
    weekly: ActiveUserTrendChange;
    monthly: ActiveUserTrendChange;
}

function trendChange(
    currentCount: number,
    priorCount: number | undefined,
): Omit<ActiveUserTrendChange, 'count'> {
    if (priorCount == null) {
        return { percentChange: null, isNewFromZero: false };
    }
    if (priorCount === 0) {
        return {
            percentChange: null,
            isNewFromZero: currentCount > 0,
        };
    }
    return {
        percentChange: ((currentCount - priorCount) / priorCount) * 100,
        isNewFromZero: false,
    };
}

const dateKey = (date: string | Date): string =>
    format(typeof date === 'string' ? parseISO(date) : date, 'yyyy-MM-dd');

export function buildActiveUserTrendChanges(
    snapshots: ActiveMetricSnapshot[],
): ActiveUserTrendChanges | null {
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
            ...trendChange(latestSnapshot.a1Count, priorDaySnapshot?.a1Count),
        },
        weekly: {
            count: latestSnapshot.a7Count,
            ...trendChange(latestSnapshot.a7Count, priorWeekSnapshot?.a7Count),
        },
        monthly: {
            count: latestSnapshot.a30Count,
            ...trendChange(
                latestSnapshot.a30Count,
                priorMonthSnapshot?.a30Count,
            ),
        },
    };
}
