'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import type { GetAnnotationsSummaryQueryParams } from '@/api/annotation/validation/get-annotations-summary-schema';
import AiPerformanceSummaryCard from '@/features/operations/ai-performance/components/ai-performance-summary-card';
import OperationsAiPerformanceMatrix from '@/features/operations/ai-performance/components/operations-ai-performance-matrix';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { Info } from 'lucide-react';

interface OperationsAiPerformanceProps {
    locationQueryParam: LocationQueryParam;
    selectedLocationName: string;
    startDate: string;
    endDate: string;
}

export default function OperationsAiPerformance({
    locationQueryParam,
    selectedLocationName,
    startDate,
    endDate,
}: OperationsAiPerformanceProps) {
    const locationFilterQueryParams =
        'district' in locationQueryParam
            ? { district: locationQueryParam.district }
            : { siteId: locationQueryParam.siteId };

    const annotationsSummaryQueryParams: GetAnnotationsSummaryQueryParams = {
        ...locationFilterQueryParams,
        startDate,
        endDate,
    };

    const {
        data: getAnnotationsSummaryResult,
        isPending: isGetAnnotationsSummaryPending,
    } = useGetAnnotationsSummary(annotationsSummaryQueryParams);

    if (isGetAnnotationsSummaryPending || !getAnnotationsSummaryResult) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    if (!getAnnotationsSummaryResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAnnotationsSummaryResult.error.message ??
                    'Failed to load annotations summary.'}
            </p>
        );
    }

    const annotationsSummary = getAnnotationsSummaryResult.data;
    const annotatedSpecimenCount = annotationsSummary.statusCounts.ANNOTATED;
    const flaggedSpecimenCount = annotationsSummary.statusCounts.FLAGGED;
    const reviewedSpecimenCount = annotatedSpecimenCount + flaggedSpecimenCount;
    const totalSpecimenCount = annotationsSummary.total;

    const specimenCoveragePercentage =
        totalSpecimenCount > 0
            ? (reviewedSpecimenCount / totalSpecimenCount) * 100
            : null;

    const summaryCards = [
        {
            label: 'Coverage',
            value:
                specimenCoveragePercentage !== null
                    ? `${specimenCoveragePercentage.toFixed(1)}%`
                    : '—',
            description: `${reviewedSpecimenCount.toLocaleString()} reviewed / ${totalSpecimenCount.toLocaleString()} total specimens`,
            accentClassName: 'border-success/40 bg-success/5',
        },
        {
            label: 'Reviewed Specimens',
            value: reviewedSpecimenCount.toLocaleString(),
            description: `${annotatedSpecimenCount.toLocaleString()} annotated and ${flaggedSpecimenCount.toLocaleString()} flagged`,
            accentClassName: 'border-border bg-card',
        },
    ] as const;

    return (
        <div className="space-y-4">
            <div className="border-accent bg-accent/40 text-accent-foreground flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
                <Info className="h-4 w-4" />
                <span>
                    Coverage reflects reviewed specimens for
                    {` ${selectedLocationName} `}
                    where review means annotated or flagged.
                </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                {summaryCards.map(summaryCard => (
                    <AiPerformanceSummaryCard
                        key={summaryCard.label}
                        accentClassName={summaryCard.accentClassName}
                        label={summaryCard.label}
                        value={summaryCard.value}
                        description={summaryCard.description}
                    />
                ))}

                <OperationsAiPerformanceMatrix
                    annotationsSummary={annotationsSummary}
                    selectedLocationName={selectedLocationName}
                />
            </div>
        </div>
    );
}
