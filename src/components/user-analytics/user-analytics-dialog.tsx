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
    buildActiveMetricsRange,
    DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    type ActiveMetricsRangePreset,
} from '@/components/user-analytics/utils/build-active-metrics-range';
import { buildActiveUserTrendChanges } from '@/components/user-analytics/utils/build-active-user-trend-changes';
import ActiveUserStatTileRow from '@/components/user-analytics/active-user-stat-tile-row';
import ActiveUserTrendChart from '@/components/user-analytics/active-user-trend-chart';
import ActiveUsersTable from '@/components/user-analytics/active-users-table';
import UserAnalyticsLabeledTabs from '@/components/user-analytics/user-analytics-labeled-tabs';

const RANGE_PRESET_TABS: {
    value: ActiveMetricsRangePreset;
    labelKey: string;
}[] = [
    { value: '30d', labelKey: 'range30d' },
    { value: '90d', labelKey: 'range90d' },
    { value: '1y', labelKey: 'range1y' },
];

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
        useGetAllUserActiveMetrics(
            {
                ...buildActiveMetricsRange(rangePreset),
                programId,
            },
            { enabled: open },
        );

    const { data: getProgramsResult } = useGetPrograms();
    const programName = getProgramsResult?.ok
        ? getProgramsResult.data.programs.find(
              program => program.programId === programId,
          )?.name
        : undefined;

    const metrics = getMetricsResult?.ok ? getMetricsResult.data.metrics : [];
    const trendChanges = buildActiveUserTrendChanges(metrics);
    const stateMessage = isMetricsPending
        ? t('loading')
        : getMetricsResult && !getMetricsResult.ok
          ? networkErrorMessage(getMetricsResult.error)
          : metrics.length === 0
            ? t('empty')
            : null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-6xl">
                <DialogHeader>
                    <DialogTitle>{t('title')}</DialogTitle>
                    <DialogDescription>
                        {programName
                            ? t('programDescription', { programName })
                            : t('description')}
                    </DialogDescription>
                </DialogHeader>

                <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 p-1 sm:grid-cols-2">
                    <div className="flex flex-col gap-4">
                        <UserAnalyticsLabeledTabs
                            value={rangePreset}
                            onValueChange={setRangePreset}
                            tabs={RANGE_PRESET_TABS}
                        />

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

                    <ActiveUsersTable open={open} programId={programId} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
