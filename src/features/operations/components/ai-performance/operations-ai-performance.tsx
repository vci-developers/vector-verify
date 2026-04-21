'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import type { GetAnnotationsSummaryQueryParams } from '@/api/annotation/validation/get-annotations-summary-schema';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import type { GetSpecimensCountQueryParams } from '@/api/specimen/validation/get-specimens-count-schema';
import { Card, CardContent } from '@/components/ui/card';
import OperationsAiPerformanceMatrix from '@/features/operations/components/ai-performance/operations-ai-performance-matrix';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { Info } from 'lucide-react';

interface OperationsAiPerformanceProps {
    locationQueryParam: LocationQueryParam;
    selectedLocationName: string;
    startDate: string;
    endDate: string;
}

interface AiPerformanceSummaryCardProps {
    accentClassName?: string;
    label: string;
    value: string;
    description: string;
}

function AiPerformanceSummaryCard({
    accentClassName,
    label,
    value,
    description,
}: AiPerformanceSummaryCardProps) {
    return (
        <Card className={`gap-0 py-0 ${accentClassName ?? ''}`}>
            <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">{label}</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">
                    {value}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                    {description}
                </p>
            </CardContent>
        </Card>
    );
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

    const specimensCountQueryParams: GetSpecimensCountQueryParams = {
        ...locationFilterQueryParams,
        startDate,
        endDate,
    };

    const {
        data: getAnnotationsSummaryResult,
        isPending: isGetAnnotationsSummaryPending,
    } = useGetAnnotationsSummary(annotationsSummaryQueryParams);

    const {
        data: getSpecimensCountResult,
        isPending: isGetSpecimensCountPending,
    } = useGetSpecimensCount(specimensCountQueryParams);

    if (
        isGetAnnotationsSummaryPending ||
        isGetSpecimensCountPending ||
        !getAnnotationsSummaryResult ||
        !getSpecimensCountResult
    ) {
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

    if (!getSpecimensCountResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getSpecimensCountResult.error.message ??
                    'Failed to load specimens count.'}
            </p>
        );
    }

    const annotatedSpecimenCount =
        getAnnotationsSummaryResult.data.statusCounts.ANNOTATED;
    const flaggedSpecimenCount =
        getAnnotationsSummaryResult.data.statusCounts.FLAGGED;
    const reviewedSpecimenCount = annotatedSpecimenCount + flaggedSpecimenCount;

    const totalSpecimenCount = getSpecimensCountResult.data.data.reduce(
        (sum, siteSpecimenCounts) => sum + siteSpecimenCounts.totalSpecimens,
        0,
    );

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
        {
            label: 'Flagged Specimens',
            value: flaggedSpecimenCount.toLocaleString(),
            description: 'Reviewed specimens that still need follow-up',
            accentClassName: 'border-warning/40 bg-warning/10',
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

            <div className="grid gap-3 lg:grid-cols-4">
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
                    annotationsSummary={getAnnotationsSummaryResult.data}
                    selectedLocationName={selectedLocationName}
                />
            </div>
        </div>
    );
}
