import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import StatBadge from '@/components/ui/stat-badge';
import TrendIndicator from '@/components/ui/trend-indicator';
import type { ActiveUserTrendChanges } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import { useTranslations } from 'next-intl';
import { Fragment } from 'react';

interface ActiveUserStatTileRowProps {
    trendChanges: ActiveUserTrendChanges | null;
    isLoading: boolean;
}

export default function ActiveUserStatTileRow({
    trendChanges,
    isLoading,
}: ActiveUserStatTileRowProps) {
    const t = useTranslations('UserAnalytics');

    const tiles = [
        {
            label: t('a1Label'),
            change: trendChanges?.daily,
            comparisonKey: 'trendComparisonDaily',
        },
        {
            label: t('a7Label'),
            change: trendChanges?.weekly,
            comparisonKey: 'trendComparisonWeekly',
        },
        {
            label: t('a30Label'),
            change: trendChanges?.monthly,
            comparisonKey: 'trendComparisonMonthly',
        },
    ];

    return (
        <div className="grid gap-3 sm:grid-cols-3">
            {tiles.map(({ label, change, comparisonKey }, index) => {
                const trendPercentChange = change?.isNewFromZero
                    ? 'new'
                    : change?.percentChange;
                const trendDescription =
                    change && change.priorCount != null
                        ? t(comparisonKey, {
                              currentCount: change.count,
                              priorCount: change.priorCount,
                          })
                        : t('trendComparisonNoPriorData');

                return (
                    <Card key={index} className="gap-0 py-3">
                        <CardContent className="flex items-center justify-between gap-2 px-3">
                            {isLoading || !change ? (
                                <Fragment>
                                    <div className="border-border space-y-1.5 rounded-lg border px-3 py-1.5">
                                        <Skeleton width="xs" height="xs" />
                                        <Skeleton width="sm" height="md" />
                                    </div>
                                    <Skeleton width="xs" height="sm" />
                                </Fragment>
                            ) : (
                                <Fragment>
                                    <StatBadge
                                        label={label}
                                        value={change.count}
                                    />
                                    {trendPercentChange != null && (
                                        <TrendIndicator
                                            percentChange={trendPercentChange}
                                            newLabel={t('newTrend')}
                                            description={trendDescription}
                                        />
                                    )}
                                </Fragment>
                            )}
                        </CardContent>
                    </Card>
                );
            })}
        </div>
    );
}
