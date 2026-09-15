'use client';

import { useGetAllUserActiveMetrics } from '@/api/user/hooks/use-get-all-user-active-metrics';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    buildActiveMetricsRange,
    DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    type ActiveMetricsRangePreset,
} from '@/components/user-analytics/utils/build-active-metrics-range';
import { buildActiveUserTrendChanges } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import ActiveUserStatTileRow from '@/components/user-analytics/active-user-stat-tile-row';
import ActiveUserTrendChart from '@/components/user-analytics/active-user-trend-chart';

const RANGE_PRESET_TABS: {
    value: ActiveMetricsRangePreset;
    labelKey: string;
}[] = [
    { value: '30d', labelKey: 'range30d' },
    { value: '90d', labelKey: 'range90d' },
    { value: '1y', labelKey: 'range1y' },
];

interface AnalyticsTabProps {
    open: boolean;
    programId: number;
}

export default function AnalyticsTab({ open, programId }: AnalyticsTabProps) {
    const t = useTranslations('UserAnalytics');
    const [rangePreset, setRangePreset] = useState<ActiveMetricsRangePreset>(
        DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    );

    const { data: getMetricsResult, isPending: isMetricsPending } =
        useGetAllUserActiveMetrics(
            {
                ...buildActiveMetricsRange(rangePreset),
                programId,
            },
            { enabled: open },
        );

    const metrics = getMetricsResult?.ok ? getMetricsResult.data.metrics : [];
    const trendChanges = buildActiveUserTrendChanges(metrics);
    const errorMessage =
        getMetricsResult && !getMetricsResult.ok
            ? networkErrorMessage(getMetricsResult.error)
            : null;
    const stateMessage = isMetricsPending
        ? t('loading')
        : (errorMessage ?? (metrics.length === 0 ? t('empty') : null));

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4 p-1">
            <Tabs
                value={rangePreset}
                onValueChange={value =>
                    setRangePreset(value as ActiveMetricsRangePreset)
                }
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {RANGE_PRESET_TABS.map(({ value, labelKey }) => (
                        <TabsTrigger
                            key={value}
                            value={value}
                            className="rounded-full"
                        >
                            {t(labelKey)}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            {stateMessage ? (
                <div className="text-muted-foreground flex h-72 w-full items-center justify-center text-sm">
                    {stateMessage}
                </div>
            ) : (
                <ActiveUserTrendChart metrics={metrics} />
            )}

            <ActiveUserStatTileRow
                trendChanges={trendChanges}
                isLoading={isMetricsPending}
            />
        </div>
    );
}
