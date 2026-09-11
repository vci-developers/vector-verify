'use client';

import { useGetUserAuthEvents } from '@/api/user/hooks/use-get-user-auth-events';
import EmptyBanner from '@/components/ui/empty-banner';
import ErrorBanner from '@/components/ui/error-banner';
import { SkeletonList } from '@/components/ui/skeleton-list';
import MonthPicker from '@/components/ui/month-picker';
import DailyLoginTable from '@/components/user-analytics/daily-login-table';
import MonthlyUsersTable from '@/components/user-analytics/monthly-users-table';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { endOfMonth, format, startOfMonth } from 'date-fns';

interface ReportTabProps {
    open: boolean;
    programId: number;
}

export default function ReportTab({ open, programId }: ReportTabProps) {
    const t = useTranslations('UserAnalytics');
    const [selectedMonth, setSelectedMonth] = useState(() =>
        startOfMonth(new Date()),
    );

    const { data: getAuthEventsResult, isPending } = useGetUserAuthEvents(
        {
            eventType: 'login',
            programId,
            startDate: format(startOfMonth(selectedMonth), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(selectedMonth), 'yyyy-MM-dd'),
        },
        { enabled: open },
    );

    const errorMessage =
        getAuthEventsResult && !getAuthEventsResult.ok
            ? networkErrorMessage(getAuthEventsResult.error)
            : null;
    const users = getAuthEventsResult?.ok ? getAuthEventsResult.data.users : [];
    const distinctUserCount = getAuthEventsResult?.ok
        ? getAuthEventsResult.data.distinctUserCount
        : 0;

    return (
        <div className="flex min-h-0 flex-1 flex-col gap-4">
            <MonthPicker
                selectedMonth={selectedMonth}
                onMonthChange={setSelectedMonth}
                maxDate={new Date()}
            />

            {isPending ? (
                <SkeletonList count={5} height="lg" width="full" />
            ) : errorMessage ? (
                <ErrorBanner message={errorMessage} />
            ) : users.length === 0 ? (
                <EmptyBanner message={t('reportEmpty')} />
            ) : (
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
            )}
        </div>
    );
}
