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
    getNetUsageRateStatus,
} from '@/features/operations/intervention-metrics/utils/intervention-metrics-helpers';
import { useTranslations } from 'next-intl';

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
    if (
        !isLoading &&
        failedSessionsMetricsQuery?.data &&
        !failedSessionsMetricsQuery.data.ok
    ) {
        return (
            <p className="text-destructive text-sm">
                {failedSessionsMetricsQuery.data.error.message}
            </p>
        );
    }

    const totals = !isLoading
        ? buildInterventionMetricsTotals(
              sessionsMetricsQueries
                  .map(query => query.data)
                  .filter(data => data != null),
          )
        : undefined;

    const netUsageRate = totals?.netUsageRatePercent ?? null;
    const netUsageStatus = getNetUsageRateStatus(netUsageRate);
    const netUsageStatusStyle = getCoverageCardStyle(netUsageStatus);

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

            <div className="grid gap-3 sm:grid-cols-2">
                <Card className={`${netUsageStatusStyle.card} gap-0 py-0`}>
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            {t('netUsageTitle')}
                        </p>
                        {isLoading ? (
                            <div className="space-y-2 py-2">
                                <Skeleton width="sm" height="xxl" />
                                <Skeleton width="lg" height="sm" />
                            </div>
                        ) : (
                            <Fragment>
                                <p className="mt-1 text-5xl font-semibold tracking-tight">
                                    {formatInterventionPercent(netUsageRate)}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {t('netUsageSubtitle', {
                                        peopleUnderNet:
                                            totals?.totalPeopleSleptUnderLlin ??
                                            0,
                                        peopleSurveyed:
                                            totals?.peopleInAllHousesInspected ??
                                            0,
                                    })}
                                </p>
                                {netUsageRate != null && (
                                    <Progress
                                        value={netUsageRate}
                                        className={`mt-3 h-2 ${netUsageStatusStyle.progressIndicator}`}
                                    />
                                )}
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatBadge
                                        label={t('peopleNotUnderNet')}
                                        value={totals?.peopleNotUnderNet ?? 0}
                                    />
                                    <StatBadge
                                        label={t('housesUsedForCollection')}
                                        value={
                                            totals?.housesUsedForCollection ?? 0
                                        }
                                    />
                                </div>
                            </Fragment>
                        )}
                    </CardContent>
                </Card>

                <Card className="border-border bg-card gap-0 py-0">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            {t('peoplePerNetTitle')}
                        </p>
                        {isLoading ? (
                            <div className="space-y-2 py-2">
                                <Skeleton width="sm" height="xxl" />
                                <Skeleton width="lg" height="sm" />
                            </div>
                        ) : (
                            <Fragment>
                                <p className="mt-1 text-5xl font-semibold tracking-tight">
                                    {formatInterventionRatio(
                                        totals?.peoplePerNetRatio ?? null,
                                    )}
                                </p>
                                <p className="text-muted-foreground mt-2 text-sm">
                                    {t('peoplePerNetDescription')}
                                </p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <StatBadge
                                        label={t('netsAvailable')}
                                        value={totals?.totalLlins ?? 0}
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
