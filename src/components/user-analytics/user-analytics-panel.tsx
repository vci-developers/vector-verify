'use client';

import { useGetUserAuthEvents } from '@/api/user/hooks/use-get-user-auth-events';
import { getUserAuthEventsReportQueryParamsSchema } from '@/api/user/validation/get-user-auth-events-report-schema';
import { Button } from '@/components/ui/button';
import EmptyBanner from '@/components/ui/empty-banner';
import ErrorBanner from '@/components/ui/error-banner';
import { SkeletonList } from '@/components/ui/skeleton-list';
import MonthPicker from '@/components/ui/month-picker';
import DailyLoginChart from '@/components/user-analytics/daily-login-chart';
import DailyLoginTable from '@/components/user-analytics/daily-login-table';
import MonthlyUsersTable from '@/components/user-analytics/monthly-users-table';
import { useFileExport } from '@/lib/export/use-file-export';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { networkErrorMessage } from '@/lib/network/network-error';
import { Download, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';

interface UserAnalyticsPanelProps {
    programId: number;
}

export default function UserAnalyticsPanel({
    programId,
}: UserAnalyticsPanelProps) {
    const t = useTranslations('UserAnalytics');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );
    const {
        isExporting,
        error: exportError,
        exportFile,
    } = useFileExport(t('exportError'));

    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const {
        data: getUserAuthEventsResult,
        isPending: isGetUserAuthEventsPending,
    } = useGetUserAuthEvents({
        eventType: 'login',
        programId,
        startDate,
        endDate,
    });

    const errorMessage =
        getUserAuthEventsResult && !getUserAuthEventsResult.ok
            ? networkErrorMessage(getUserAuthEventsResult.error)
            : null;
    const users = getUserAuthEventsResult?.ok
        ? getUserAuthEventsResult.data.users
        : [];
    const distinctUserCount = getUserAuthEventsResult?.ok
        ? getUserAuthEventsResult.data.distinctUserCount
        : 0;

    function handleExport() {
        const queryString = constructQueryString(
            { startDate, endDate, programId },
            getUserAuthEventsReportQueryParamsSchema,
        );

        exportFile(
            `/api/users/auth-events/report${queryString}`,
            `user-auth-events-report-${startDate}-to-${endDate}.xlsx`,
        );
    }

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <div className="flex items-center justify-between gap-4">
                <MonthPicker
                    selectedMonth={selectedMonth}
                    onMonthChange={setSelectedMonth}
                    maxDate={new Date()}
                />

                <Button
                    variant="outline"
                    size="sm"
                    onClick={handleExport}
                    disabled={isExporting || users.length === 0}
                >
                    {isExporting ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Download />
                    )}
                    {isExporting ? t('exportingButton') : t('exportButton')}
                </Button>
            </div>

            {exportError && (
                <p className="text-destructive text-sm">{exportError}</p>
            )}

            {isGetUserAuthEventsPending ? (
                <SkeletonList count={5} height="lg" width="full" />
            ) : errorMessage ? (
                <ErrorBanner message={errorMessage} />
            ) : users.length === 0 ? (
                <EmptyBanner message={t('noLoginsInMonth')} />
            ) : (
                <Fragment>
                    <DailyLoginChart
                        users={users}
                        selectedMonth={selectedMonth}
                    />

                    <div className="grid min-h-0 flex-1 grid-cols-1 gap-6 sm:grid-cols-2">
                        <MonthlyUsersTable
                            users={users}
                            distinctUserCount={distinctUserCount}
                        />
                        <DailyLoginTable
                            users={users}
                            selectedMonth={selectedMonth}
                        />
                    </div>
                </Fragment>
            )}
        </div>
    );
}
