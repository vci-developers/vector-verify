'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import type { GetAnnotationsSummaryQueryParams } from '@/api/annotation/validation/get-annotations-summary-schema';
import { Card, CardContent } from '@/components/ui/card';
import SpecimenConfusionMatrix from './specimen-confusion-matrix';
import { Info } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';
import { Skeleton } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';
import ErrorBanner from '@/components/ui/error-banner';
import { cn } from '@/utils/cn';

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
    const t = useTranslations('OperationsAIPerformance');
    const annotationsSummaryQueryParams: GetAnnotationsSummaryQueryParams = {
        siteIds,
        startDate,
        endDate,
    };

    const {
        data: getAnnotationsSummaryResult,
        isPending: isGetAnnotationsSummaryPending,
    } = useGetAnnotationsSummary(annotationsSummaryQueryParams);

    const isLoading =
        isGetAnnotationsSummaryPending || !getAnnotationsSummaryResult;
    const isError = !isLoading && !getAnnotationsSummaryResult.ok;

    const annotationsSummary = getAnnotationsSummaryResult?.ok
        ? getAnnotationsSummaryResult.data
        : undefined;
    const annotatedSpecimens = annotationsSummary?.statusCounts.ANNOTATED;
    const flaggedSpecimens = annotationsSummary?.statusCounts.FLAGGED;
    const reviewedSpecimens =
        annotatedSpecimens != null && flaggedSpecimens != null
            ? annotatedSpecimens + flaggedSpecimens
            : 0;
    const totalSpecimens = annotationsSummary?.total || 0;

    const reviewedSpecimensCoverage =
        totalSpecimens && totalSpecimens > 0
            ? (reviewedSpecimens / totalSpecimens) * 100
            : null;

    return (
        <div className="space-y-4">
            {isError ? (
                <ErrorBanner message={t('failedToLoad')} />
            ) : (
                <div className="border-accent bg-accent/40 text-accent-foreground flex items-center gap-2 rounded-lg border px-4 py-3 text-sm">
                    <Info className="h-4 w-4" />
                    <span>{t('coverageReflects')}</span>
                </div>
            )}

            <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
                <Fragment>
                    <Card
                        className={cn(
                            !isError && 'border-success/40 bg-success/5',
                            'gap-0 py-0',
                        )}
                    >
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">
                                {t('coverage')}
                            </p>
                            {isLoading || isError ? (
                                <div className="space-y-2 py-2">
                                    <Skeleton
                                        width="sm"
                                        height="xl"
                                        variant={
                                            isError ? 'destructive' : 'default'
                                        }
                                    />
                                    <Skeleton
                                        width="lg"
                                        height="sm"
                                        variant={
                                            isError ? 'destructive' : 'default'
                                        }
                                    />
                                </div>
                            ) : (
                                <Fragment>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight">
                                        {reviewedSpecimensCoverage !== null
                                            ? `${reviewedSpecimensCoverage.toFixed(1)}%`
                                            : '—'}
                                    </p>

                                    <p className="text-muted-foreground mt-2 text-xs">
                                        {t('reviewedOfTotal', {
                                            count: reviewedSpecimens.toLocaleString(),
                                            total: totalSpecimens.toLocaleString(),
                                        })}
                                    </p>
                                </Fragment>
                            )}
                        </CardContent>
                    </Card>

                    <Card className="border-border bg-card gap-0 py-0">
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">
                                {t('reviewedSpecimens')}
                            </p>
                            {isLoading || isError ? (
                                <div className="space-y-2 py-2">
                                    <Skeleton
                                        width="sm"
                                        height="xl"
                                        variant={
                                            isError ? 'destructive' : 'default'
                                        }
                                    />
                                    <Skeleton
                                        width="lg"
                                        height="sm"
                                        variant={
                                            isError ? 'destructive' : 'default'
                                        }
                                    />
                                </div>
                            ) : (
                                <Fragment>
                                    <p className="mt-1 text-4xl font-semibold tracking-tight">
                                        {reviewedSpecimens?.toLocaleString() ||
                                            '—'}
                                    </p>
                                    <p className="text-muted-foreground mt-2 text-xs">
                                        {t('annotatedAndFlagged', {
                                            annotated:
                                                annotatedSpecimens?.toLocaleString() ||
                                                '—',
                                            flagged:
                                                flaggedSpecimens?.toLocaleString() ||
                                                '—',
                                        })}
                                    </p>
                                </Fragment>
                            )}
                        </CardContent>
                    </Card>
                </Fragment>

                <SpecimenConfusionMatrix
                    title="Species Confusion Matrix"
                    classificationCategory="species"
                    groundTruthAxisLabel="Visual Verification Species Label"
                    predictionAxisLabel="VectorCam Species Label"
                    confusionMatrix={
                        annotationsSummary?.confusionMatrices?.species
                    }
                    isLoading={isLoading}
                    isError={isError}
                />

                <SpecimenConfusionMatrix
                    title="Sex Confusion Matrix"
                    classificationCategory="sex"
                    groundTruthAxisLabel="Visual Verification Sex Label"
                    predictionAxisLabel="VectorCam Sex Label"
                    confusionMatrix={annotationsSummary?.confusionMatrices?.sex}
                    isLoading={isLoading}
                    isError={isError}
                />

                <SpecimenConfusionMatrix
                    title="Abdomen Status Confusion Matrix"
                    classificationCategory="abdomen status"
                    groundTruthAxisLabel="Visual Verification Abdomen Status Label"
                    predictionAxisLabel="VectorCam Abdomen Status Label"
                    confusionMatrix={
                        annotationsSummary?.confusionMatrices?.abdomenStatus
                    }
                    isLoading={isLoading}
                    isError={isError}
                />
            </div>
        </div>
    );
}
