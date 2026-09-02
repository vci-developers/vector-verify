import { subDays, format } from 'date-fns';
import type { ActiveMetricSnapshot } from '@/api/user/validation/active-metric-snapshot-schema';

export interface ActiveUserTrendChange {
    count: number;
    percentChange: number | null;
}

export interface ActiveUserTrendChanges {
    daily: ActiveUserTrendChange;
    weekly: ActiveUserTrendChange;
    monthly: ActiveUserTrendChange;
}

function percentChange(
    currentCount: number,
    priorCount: number | undefined,
): number | null {
    if (priorCount == null || priorCount === 0) return null;
    return ((currentCount - priorCount) / priorCount) * 100;
}

export function buildActiveUserTrendChanges(
    snapshots: ActiveMetricSnapshot[],
): ActiveUserTrendChanges | null {
    if (snapshots.length === 0) return null;

    const snapshotsByDate = new Map(
        snapshots.map(snapshot => [snapshot.snapshotDate, snapshot]),
    );

    const latestSnapshot = snapshots.reduce((latest, snapshot) =>
        snapshot.snapshotDate.localeCompare(latest.snapshotDate) > 0
            ? snapshot
            : latest,
    );
    const latestDate = new Date(latestSnapshot.snapshotDate);

    const priorDaySnapshot = snapshotsByDate.get(
        format(subDays(latestDate, 1), 'yyyy-MM-dd'),
    );
    const priorWeekSnapshot = snapshotsByDate.get(
        format(subDays(latestDate, 7), 'yyyy-MM-dd'),
    );
    const priorMonthSnapshot = snapshotsByDate.get(
        format(subDays(latestDate, 30), 'yyyy-MM-dd'),
    );

    return {
        daily: {
            count: latestSnapshot.a1Count,
            percentChange: percentChange(
                latestSnapshot.a1Count,
                priorDaySnapshot?.a1Count,
            ),
        },
        weekly: {
            count: latestSnapshot.a7Count,
            percentChange: percentChange(
                latestSnapshot.a7Count,
                priorWeekSnapshot?.a7Count,
            ),
        },
        monthly: {
            count: latestSnapshot.a30Count,
            percentChange: percentChange(
                latestSnapshot.a30Count,
                priorMonthSnapshot?.a30Count,
            ),
        },
    };
}
