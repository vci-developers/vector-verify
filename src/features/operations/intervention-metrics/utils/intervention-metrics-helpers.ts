import type { GetSessionsMetricsResponseBody } from '@/api/session/validation/get-sessions-metrics-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';

export interface InterventionMetricsTotals {
    peopleInAllHousesInspected: number | null;
    housesUsedForCollection: number | null;
    totalPeopleSleptUnderLlin: number | null;
    totalLlins: number | null;
    peopleNotUnderNet: number | null;
    peoplePerNetRatio: number | null;
    netUsageRatePercent: number | null;
}

function sumDistrictValues(
    values: (number | null | undefined)[],
): number | null {
    const presentValues = values.filter(
        (value): value is number => value != null,
    );
    if (presentValues.length === 0) return null;
    return presentValues.reduce((total, value) => total + value, 0);
}

export function buildInterventionMetricsTotals(
    districtMetricsResults: Result<
        GetSessionsMetricsResponseBody,
        NetworkError
    >[],
): InterventionMetricsTotals {
    const districtMetrics = districtMetricsResults
        .filter(result => result.ok)
        .map(result => result.data);

    const peopleInAllHousesInspected = sumDistrictValues(
        districtMetrics.map(
            metrics => metrics.siteInformation.peopleInAllHousesInspected,
        ),
    );
    const housesUsedForCollection = sumDistrictValues(
        districtMetrics.map(
            metrics => metrics.siteInformation.housesUsedForCollection,
        ),
    );
    const totalPeopleSleptUnderLlin = sumDistrictValues(
        districtMetrics.map(
            metrics => metrics.entomologicalSummary.totalPeopleSleptUnderLlin,
        ),
    );
    const totalLlins = sumDistrictValues(
        districtMetrics.map(metrics => metrics.entomologicalSummary.totalLlins),
    );

    const peopleNotUnderNet =
        peopleInAllHousesInspected != null && totalPeopleSleptUnderLlin != null
            ? peopleInAllHousesInspected - totalPeopleSleptUnderLlin
            : null;

    const peoplePerNetRatio =
        totalPeopleSleptUnderLlin != null && totalLlins
            ? totalPeopleSleptUnderLlin / totalLlins
            : null;

    const netUsageRatePercent =
        totalPeopleSleptUnderLlin != null && peopleInAllHousesInspected
            ? (totalPeopleSleptUnderLlin / peopleInAllHousesInspected) * 100
            : null;

    return {
        peopleInAllHousesInspected,
        housesUsedForCollection,
        totalPeopleSleptUnderLlin,
        totalLlins,
        peopleNotUnderNet,
        peoplePerNetRatio,
        netUsageRatePercent,
    };
}

export type CoverageStatus = 'critical' | 'needsImprovement' | 'good';

const NET_USAGE_RATE_CRITICAL_MAX_PERCENT = 30;
const NET_USAGE_RATE_GOOD_MIN_PERCENT = 80;

export function getNetUsageRateStatus(
    netUsageRatePercent: number | null,
): CoverageStatus | null {
    if (netUsageRatePercent == null) return null;
    if (netUsageRatePercent < NET_USAGE_RATE_CRITICAL_MAX_PERCENT)
        return 'critical';
    if (netUsageRatePercent < NET_USAGE_RATE_GOOD_MIN_PERCENT)
        return 'needsImprovement';
    return 'good';
}

const NEUTRAL_CARD_STYLE = {
    card: 'border-border bg-card',
    progressIndicator: '',
};

const COVERAGE_STATUS_STYLES: Record<
    CoverageStatus,
    { card: string; progressIndicator: string }
> = {
    critical: {
        card: 'border-destructive/40 bg-destructive/5',
        progressIndicator: '[&_[data-slot=progress-indicator]]:bg-destructive',
    },
    needsImprovement: {
        card: 'border-warning/40 bg-warning/5',
        progressIndicator: '[&_[data-slot=progress-indicator]]:bg-warning',
    },
    good: {
        card: 'border-success/40 bg-success/5',
        progressIndicator: '[&_[data-slot=progress-indicator]]:bg-success',
    },
};

export function getCoverageCardStyle(status: CoverageStatus | null) {
    return status ? COVERAGE_STATUS_STYLES[status] : NEUTRAL_CARD_STYLE;
}

const UNAVAILABLE_PLACEHOLDER = '—';

export function formatInterventionPercent(value: number | null): string {
    return value != null ? `${value.toFixed(1)}%` : UNAVAILABLE_PLACEHOLDER;
}

export function formatInterventionRatio(value: number | null): string {
    return value != null ? value.toFixed(2) : UNAVAILABLE_PLACEHOLDER;
}
