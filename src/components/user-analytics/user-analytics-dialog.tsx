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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
    buildActiveMetricsRange,
    DEFAULT_ACTIVE_METRICS_RANGE_PRESET,
    type ActiveMetricsRangePreset,
} from '@/components/user-analytics/utils/build-active-metrics-range';
import ActiveUserTrendChart from '@/components/user-analytics/active-user-trend-chart';
import UserAnalyticsRangeTabs from '@/components/user-analytics/user-analytics-range-tabs';

type UserAnalyticsView = 'trend' | 'active-users';

const DEFAULT_USER_ANALYTICS_VIEW: UserAnalyticsView = 'trend';

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
    const [view, setView] = useState<UserAnalyticsView>(
        DEFAULT_USER_ANALYTICS_VIEW,
    );
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
    const stateMessage = isMetricsPending
        ? t('loading')
        : getMetricsResult && !getMetricsResult.ok
          ? networkErrorMessage(getMetricsResult.error)
          : metrics.length === 0
            ? t('empty')
            : null;

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

                <Tabs
                    value={view}
                    onValueChange={value => setView(value as UserAnalyticsView)}
                >
                    <TabsList>
                        <TabsTrigger value="trend">{t('trendTab')}</TabsTrigger>
                        <TabsTrigger value="active-users">
                            {t('activeUsersTab')}
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="trend" className="flex flex-col gap-4">
                        <UserAnalyticsRangeTabs
                            value={rangePreset}
                            onValueChange={setRangePreset}
                        />

                        {stateMessage ? (
                            <div className="text-muted-foreground flex h-72 w-full items-center justify-center text-sm">
                                {stateMessage}
                            </div>
                        ) : (
                            <ActiveUserTrendChart metrics={metrics} />
                        )}
                    </TabsContent>

                    <TabsContent value="active-users" />
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
