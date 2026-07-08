import { format, subDays, subYears } from 'date-fns';

export type ActiveMetricsRangePreset = '30d' | '90d' | '1y';

export const DEFAULT_ACTIVE_METRICS_RANGE_PRESET: ActiveMetricsRangePreset =
    '90d';

export interface ActiveMetricsDateRange {
    startDate: string;
    endDate: string;
}

export function buildActiveMetricsRange(
    preset: ActiveMetricsRangePreset,
    endDate: Date = new Date(),
): ActiveMetricsDateRange {
    const startDate =
        preset === '1y'
            ? subYears(endDate, 1)
            : subDays(endDate, preset === '30d' ? 30 : 90);

    return {
        startDate: format(startDate, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
    };
}
