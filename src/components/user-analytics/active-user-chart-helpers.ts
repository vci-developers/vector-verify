import type { ActiveMetricSnapshot } from '@/api/user/validation/get-user-active-metrics-schema';
import type { ChartConfig } from '@/components/ui/chart';

export type ActiveUserSeriesKey = 'a1Count' | 'a7Count' | 'a30Count';

const ACTIVE_USER_SERIES_COLORS: Record<ActiveUserSeriesKey, string> = {
    a1Count: 'var(--chart-1)',
    a7Count: 'var(--chart-2)',
    a30Count: 'var(--chart-3)',
};

export function buildActiveUserChartConfig(
    labels: Record<ActiveUserSeriesKey, string>,
): ChartConfig {
    return Object.fromEntries(
        (Object.keys(ACTIVE_USER_SERIES_COLORS) as ActiveUserSeriesKey[]).map(
            seriesKey => [
                seriesKey,
                {
                    label: labels[seriesKey],
                    color: ACTIVE_USER_SERIES_COLORS[seriesKey],
                },
            ],
        ),
    );
}

export function sortActiveMetricsByDate(
    metrics: ActiveMetricSnapshot[],
): ActiveMetricSnapshot[] {
    return [...metrics].sort((firstSnapshot, secondSnapshot) =>
        firstSnapshot.snapshotDate.localeCompare(secondSnapshot.snapshotDate),
    );
}
