'use client';

import { Fragment } from 'react';
import type { Site } from '@/api/site/validation/site-schema';
import { useGetSessionsMetricsByDistricts } from '@/api/session/hooks/use-get-sessions-metrics';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import StatBadge from '@/components/ui/stat-badge';
import { getUniqueDistricts } from '@/lib/location/site-tree';
import {
    buildInterventionMetricsTotals,
    formatInterventionPercent,
    formatInterventionRatio,
    getCoverageCardStyle,
} from '@/features/operations/intervention-metrics/utils/intervention-metrics-helpers';
import { useTranslations } from 'next-intl';
import ErrorBanner from '@/components/ui/error-banner';
import { cn } from '@/utils/cn';

interface OperationsInterventionMetricsProps {
    sites: Site[];
    startDate: string;
    endDate: string;
}

export default function OperationsInterventionMetrics({
    sites,
    startDate,
    endDate,
}: OperationsInterventionMetricsProps) {
    const t = useTranslations('OperationsInterventionMetrics');

    const districts = getUniqueDistricts(sites);

    const sessionsMetricsQueries = useGetSessionsMetricsByDistricts(
        districts,
        startDate,
        endDate,
    );

    const isLoading = sessionsMetricsQueries.some(query => query.isPending);

    const failedSessionsMetricsQuery = sessionsMetricsQueries.find(
        query => query.data && !query.data.ok,
    );
    const isError =
        !isLoading &&
        failedSessionsMetricsQuery?.data &&
        !failedSessionsMetricsQuery.data.ok;
    // if (
    //     !isLoading &&
    //     failedSessionsMetricsQuery?.data &&
    //     !failedSessionsMetricsQuery.data.ok
    // ) {
    //     return (
    //         <ErrorBanner
    //             message={
    //                 failedSessionsMetricsQuery.data.error.message ??
    //                 t('failedToLoad')
    //             }
    //         />
    //     );
    // }
    const errorMessage =
        !isLoading &&
        failedSessionsMetricsQuery?.data &&
        !failedSessionsMetricsQuery.data.ok
            ? (failedSessionsMetricsQuery.data.error.message ??
              t('failedToLoad'))
            : '';

    const interventionMetricsTotals = !isLoading
        ? buildInterventionMetricsTotals(
              sessionsMetricsQueries
                  .map(query => query.data)
                  .filter(data => data != null),
          )
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

            {isError && <ErrorBanner message={errorMessage} />}

            <div className="grid gap-3 sm:grid-cols-2">
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
                            <div className="space-y-2 py-2">
                                <Skeleton
                                    width="sm"
                                    height="xxl"
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
                            <div className="space-y-2 py-2">
                                <Skeleton
                                    width="sm"
                                    height="xxl"
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
            </div>
        </div>
    );
}
