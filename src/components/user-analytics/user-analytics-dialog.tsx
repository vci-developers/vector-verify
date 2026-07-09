'use client';

import { useGetPrograms } from '@/api/program/hooks/use-get-programs';
import { useGetAllUserActiveMetrics } from '@/api/user/hooks/use-get-all-user-active-metrics';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    buildActiveUserChartConfig,
    sortActiveMetricsByDate,
} from '@/components/user-analytics/active-user-chart-helpers';
import {
    buildActiveMetricsRange,
    DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    type ActiveMetricsRangePreset,
} from '@/components/user-analytics/build-active-metrics-range';
import ActiveUserTrendChart from '@/components/user-analytics/active-user-trend-chart';
import UserAnalyticsRangeTabs from '@/components/user-analytics/user-analytics-range-tabs';

interface UserAnalyticsDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: number;
}

export default function UserAnalyticsDialog({
    open,
    onOpenChange,
    programId,
}: UserAnalyticsDialogProps) {
    const t = useTranslations('UserAnalytics');
    const [rangePreset, setRangePreset] = useState<ActiveMetricsRangePreset>(
        DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    );

    const { data: getMetricsResult, isPending: isMetricsPending } =
        useGetAllUserActiveMetrics({
            ...buildActiveMetricsRange(rangePreset),
            programId,
        });

    const { data: getProgramsResult } = useGetPrograms();
    const programName = getProgramsResult?.ok
        ? getProgramsResult.data.programs.find(
              program => program.programId === programId,
          )?.name
        : undefined;

    const chartConfig = buildActiveUserChartConfig({
        a1Count: t('a1Label'),
        a7Count: t('a7Label'),
        a30Count: t('a30Label'),
    });
    const chartData = getMetricsResult?.ok
        ? sortActiveMetricsByDate(getMetricsResult.data.metrics)
        : [];

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {programName
                            ? t('programDescription', { programName })
                            : t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-4">
                    <UserAnalyticsRangeTabs
                        value={rangePreset}
                        onValueChange={setRangePreset}
                    />

                    {isMetricsPending ? (
                        <ActiveUserStateMessage message={t('loading')} />
                    ) : getMetricsResult && !getMetricsResult.ok ? (
                        <ActiveUserStateMessage
                            message={networkErrorMessage(
                                getMetricsResult.error,
                            )}
                        />
                    ) : chartData.length === 0 ? (
                        <ActiveUserStateMessage message={t('empty')} />
                    ) : (
                        <ActiveUserTrendChart
                            data={chartData}
                            config={chartConfig}
                            xAxisLabel={t('axisDateLabel')}
                            yAxisLabel={t('axisActiveUsersLabel')}
                        />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}

function ActiveUserStateMessage({ message }: { message: string }) {
    return (
        <div className="text-muted-foreground flex h-72 w-full items-center justify-center text-sm">
            {message}
        </div>
    );
}
