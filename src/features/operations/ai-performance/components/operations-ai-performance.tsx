'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import type { GetAnnotationsSummaryQueryParams } from '@/api/annotation/validation/get-annotations-summary-schema';
import { Card, CardContent } from '@/components/ui/card';
import SpecimenConfusionMatrix from './specimen-confusion-matrix';
import { Info } from 'lucide-react';

interface OperationsAiPerformanceProps {
    siteIds: number[];
    startDate: string;
    endDate: string;
}

export default function OperationsAiPerformance({
    siteIds,
    startDate,
    endDate,
}: OperationsAiPerformanceProps) {
    const annotationsSummaryQueryParams: GetAnnotationsSummaryQueryParams = {
        siteIds,
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
    const annotatedSpecimens = annotationsSummary.statusCounts.ANNOTATED;
    const flaggedSpecimens = annotationsSummary.statusCounts.FLAGGED;
    const reviewedSpecimens = annotatedSpecimens + flaggedSpecimens;
    const totalSpecimens = annotationsSummary.total;

    const reviewedSpecimensCoverage =
        totalSpecimens > 0 ? (reviewedSpecimens / totalSpecimens) * 100 : null;

    return (
        <div className="space-y-4">
            <div className="border-accent bg-accent/40 text-accent-foreground flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
                <Info className="h-4 w-4" />
                <span>
                    Coverage reflects reviewed specimens for the selected
                    location(s) where review means annotated or flagged.
                </span>
            </div>

            <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
                <Card className="border-success/40 bg-success/5 gap-0 py-0">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Coverage
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {reviewedSpecimensCoverage !== null
                                ? `${reviewedSpecimensCoverage.toFixed(1)}%`
                                : '—'}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {reviewedSpecimens.toLocaleString()} reviewed /{' '}
                            {totalSpecimens.toLocaleString()} total specimens
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border bg-card gap-0 py-0">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Reviewed Specimens
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {reviewedSpecimens.toLocaleString()}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {annotatedSpecimens.toLocaleString()} annotated and{' '}
                            {flaggedSpecimens.toLocaleString()} flagged
                        </p>
                    </CardContent>
                </Card>

                {annotationsSummary.confusionMatrices?.species && (
                    <SpecimenConfusionMatrix
                        title="Species Confusion Matrix"
                        classificationCategory="species"
                        groundTruthAxisLabel="Visual Verification Species Label"
                        predictionAxisLabel="VectorCam Species Label"
                        confusionMatrix={
                            annotationsSummary.confusionMatrices.species
                        }
                    />
                )}

                {annotationsSummary.confusionMatrices?.sex && (
                    <SpecimenConfusionMatrix
                        title="Sex Confusion Matrix"
                        classificationCategory="sex"
                        groundTruthAxisLabel="Visual Verification Sex Label"
                        predictionAxisLabel="VectorCam Sex Label"
                        confusionMatrix={
                            annotationsSummary.confusionMatrices.sex
                        }
                    />
                )}

                {annotationsSummary.confusionMatrices?.abdomenStatus && (
                    <SpecimenConfusionMatrix
                        title="Abdomen Status Confusion Matrix"
                        classificationCategory="abdomen status"
                        groundTruthAxisLabel="Visual Verification Abdomen Status Label"
                        predictionAxisLabel="VectorCam Abdomen Status Label"
                        confusionMatrix={
                            annotationsSummary.confusionMatrices.abdomenStatus
                        }
                    />
                )}
            </div>
        </div>
    );
}
