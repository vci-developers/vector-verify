import type { GetSessionsMetricsSuccessPayload } from '@/api/session/validation/get-sessions-metrics-schema';

export interface InterventionMetricsTotals {
    peopleInAllHousesInspected: number | null;
    housesUsedForCollection: number | null;
    totalPeopleSleptUnderLlin: number | null;
    totalLlins: number | null;
    peopleNotUnderNet: number | null;
    peoplePerNetRatio: number | null;
    netUsageRatePercent: number | null;
    totalFedAnopheles: number | null;
    fedAnophelesToPeopleSleptRatio: number | null;
}

export function buildInterventionMetricsTotals(
    sessionsMetrics: GetSessionsMetricsSuccessPayload,
): InterventionMetricsTotals {
    const peopleInAllHousesInspected =
        sessionsMetrics.siteInformation.peopleInAllHousesInspected ?? null;
    const housesUsedForCollection =
        sessionsMetrics.siteInformation.housesUsedForCollection ?? null;
    const totalPeopleSleptUnderLlin =
        sessionsMetrics.entomologicalSummary.totalPeopleSleptUnderLlin ?? null;
    const totalLlins = sessionsMetrics.entomologicalSummary.totalLlins ?? null;
    const totalFedAnopheles =
        sessionsMetrics.entomologicalSummary.totalFedAnopheles ?? null;

    const peopleNotUnderNet =
        peopleInAllHousesInspected != null && totalPeopleSleptUnderLlin != null
            ? Math.max(
                  0,
                  peopleInAllHousesInspected - totalPeopleSleptUnderLlin,
              )
            : null;

    const peoplePerNetRatio =
        totalPeopleSleptUnderLlin != null && totalLlins
            ? totalPeopleSleptUnderLlin / totalLlins
            : null;

    const netUsageRatePercent =
        totalPeopleSleptUnderLlin != null &&
        peopleInAllHousesInspected &&
        totalLlins
            ? Math.min(
                  100,
                  (totalPeopleSleptUnderLlin / peopleInAllHousesInspected) *
                      100,
              )
            : null;

    const fedAnophelesToPeopleSleptRatio =
        totalFedAnopheles != null && totalPeopleSleptUnderLlin
            ? totalFedAnopheles / totalPeopleSleptUnderLlin
            : null;

    return {
        peopleInAllHousesInspected,
        housesUsedForCollection,
        totalPeopleSleptUnderLlin,
        totalLlins,
        peopleNotUnderNet,
        peoplePerNetRatio,
        netUsageRatePercent,
        totalFedAnopheles,
        fedAnophelesToPeopleSleptRatio,
    };
}

const NET_USAGE_RATE_CRITICAL_MAX_PERCENT = 30;
const NET_USAGE_RATE_GOOD_MIN_PERCENT = 80;

export function getCoverageCardStyle(netUsageRatePercent: number | null): {
    card: string;
    progressIndicator: string;
} {
    if (netUsageRatePercent == null) {
        return { card: 'border-border bg-card', progressIndicator: '' };
    }
    if (netUsageRatePercent < NET_USAGE_RATE_CRITICAL_MAX_PERCENT) {
        return {
            card: 'border-destructive/40 bg-destructive/5',
            progressIndicator:
                '[&_[data-slot=progress-indicator]]:bg-destructive',
        };
    }
    if (netUsageRatePercent < NET_USAGE_RATE_GOOD_MIN_PERCENT) {
        return {
            card: 'border-warning/40 bg-warning/5',
            progressIndicator: '[&_[data-slot=progress-indicator]]:bg-warning',
        };
    }
    return {
        card: 'border-success/40 bg-success/5',
        progressIndicator: '[&_[data-slot=progress-indicator]]:bg-success',
    };
}

const UNAVAILABLE_PLACEHOLDER = '—';

export function formatInterventionPercent(value: number | null): string {
    return value != null ? `${value.toFixed(1)}%` : UNAVAILABLE_PLACEHOLDER;
}

export function formatInterventionRatio(value: number | null): string {
    return value != null ? value.toFixed(2) : UNAVAILABLE_PLACEHOLDER;
}
