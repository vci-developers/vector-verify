'use client';

import { Fragment } from 'react';
import { useGetSessionsMetrics } from '@/api/session/hooks/use-get-sessions-metrics';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import StatBadge from '@/components/ui/stat-badge';
import {
    buildInterventionMetricsTotals,
    formatInterventionPercent,
    formatInterventionRatio,
    getCoverageCardStyle,
} from '@/features/operations/intervention-metrics/utils/intervention-metrics-helpers';
import { useTranslations } from 'next-intl';
import ErrorBanner from '@/components/ui/error-banner';
import { cn } from '@/utils/cn';
import { StatCardSkeleton } from '@/components/ui/stat-card-skeleton';

interface OperationsInterventionMetricsProps {
    siteIds: number[];
    startDate: string;
    endDate: string;
}

export default function OperationsInterventionMetrics({
    siteIds,
    startDate,
    endDate,
}: OperationsInterventionMetricsProps) {
    const t = useTranslations('OperationsInterventionMetrics');

    const {
        data: getSessionsMetricsResult,
        isPending: isGetSessionsMetricsPending,
    } = useGetSessionsMetrics({ siteIds, startDate, endDate });

    const isLoading = isGetSessionsMetricsPending || !getSessionsMetricsResult;
    const isError = !isLoading && !getSessionsMetricsResult.ok;

    const interventionMetricsTotals = getSessionsMetricsResult?.ok
        ? buildInterventionMetricsTotals(getSessionsMetricsResult.data)
        : undefined;

    const netUsageRate = interventionMetricsTotals?.netUsageRatePercent ?? null;
    const netUsageStatusStyle = getCoverageCardStyle(netUsageRate);
    const hasNoLlinsDistributed = interventionMetricsTotals?.totalLlins === 0;

    return (
        <div className="space-y-3">
            <div>
                <h2 className="text-lg font-semibold tracking-tight">
                    {t('interventionMetricsTitle')}
                </h2>
                <p className="text-muted-foreground text-sm">
                    {t('interventionMetricsDescription')}
                </p>
            </div>

            {isError && <ErrorBanner message={t('failedToLoad')} />}

            <div className="grid gap-3 sm:grid-cols-3">
                <Card
                    className={cn(
                        !isError && `${netUsageStatusStyle.card}`,
                        'gap-0 py-0',
                    )}
                >
                    <CardContent className="flex h-full flex-col p-4">
                        <p className="text-muted-foreground text-sm">
                            {t('netUsageTitle')}
                        </p>
                        {isLoading || isError ? (
                            <StatCardSkeleton
                                variant={isError ? 'destructive' : 'default'}
                            />
                        ) : (
                            <Fragment>
                                <p className="mt-1 text-5xl font-semibold tracking-tight">
                                    {hasNoLlinsDistributed
                                        ? formatInterventionPercent(null)
                                        : formatInterventionPercent(
                                              netUsageRate,
                                          )}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {hasNoLlinsDistributed
                                        ? t('noLlinsDistributed')
                                        : t('netUsageSubtitle', {
                                              peopleUnderNet:
                                                  interventionMetricsTotals?.totalPeopleSleptUnderLlin ??
                                                  0,
                                              peopleSurveyed:
                                                  interventionMetricsTotals?.peopleInAllHousesInspected ??
                                                  0,
                                          })}
                                </p>
                                {netUsageRate != null && (
                                    <Progress
                                        value={netUsageRate}
                                        className={`mt-3 h-2 ${netUsageStatusStyle.progressIndicator}`}
                                    />
                                )}
                                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                    <StatBadge
                                        label={t('peopleNotUnderNet')}
                                        value={
                                            interventionMetricsTotals?.peopleNotUnderNet ??
                                            0
                                        }
                                    />
                                    <StatBadge
                                        label={t('housesUsedForCollection')}
                                        value={
                                            interventionMetricsTotals?.housesUsedForCollection ??
                                            0
                                        }
                                    />
                                </div>
                            </Fragment>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border bg-card gap-0 py-0">
                    <CardContent className="flex h-full flex-col p-4">
                        <p className="text-muted-foreground text-sm">
                            {t('peoplePerNetTitle')}
                        </p>
                        {isLoading || isError ? (
                            <StatCardSkeleton
                                variant={isError ? 'destructive' : 'default'}
                            />
                        ) : (
                            <Fragment>
                                <p className="mt-1 text-5xl font-semibold tracking-tight">
                                    {formatInterventionRatio(
                                        interventionMetricsTotals?.peoplePerNetRatio ??
                                            null,
                                    )}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {t('peoplePerNetDescription')}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                    <StatBadge
                                        label={t('netsAvailable')}
                                        value={
                                            interventionMetricsTotals?.totalLlins ??
                                            0
                                        }
                                    />
                                </div>
                            </Fragment>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border bg-card gap-0 py-0">
                    <CardContent className="flex h-full flex-col p-4">
                        <p className="text-muted-foreground text-sm">
                            {t('fedAnophelesRatioTitle')}
                        </p>
                        {isLoading || isError ? (
                            <StatCardSkeleton
                                variant={isError ? 'destructive' : 'default'}
                            />
                        ) : (
                            <Fragment>
                                <p className="mt-1 text-5xl font-semibold tracking-tight">
                                    {formatInterventionRatio(
                                        interventionMetricsTotals?.fedAnophelesToPeopleSleptRatio ??
                                            null,
                                    )}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {t('fedAnophelesRatioDescription')}
                                </p>
                                <div className="mt-auto flex flex-wrap gap-2 pt-4">
                                    <StatBadge
                                        label={t('totalFedAnopheles')}
                                        value={
                                            interventionMetricsTotals?.totalFedAnopheles ??
                                            0
                                        }
                                    />
                                    <StatBadge
                                        label={t('peopleSleptUnderNet')}
                                        value={
                                            interventionMetricsTotals?.totalPeopleSleptUnderLlin ??
                                            0
                                        }
                                    />
                                </div>
                            </Fragment>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
