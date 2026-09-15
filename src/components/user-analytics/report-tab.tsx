'use client';

import { useGetUserAuthEvents } from '@/api/user/hooks/use-get-user-auth-events';
import { getUserAuthEventsReportQueryParamsSchema } from '@/api/user/validation/get-user-auth-events-report-schema';
import { Button } from '@/components/ui/button';
import EmptyBanner from '@/components/ui/empty-banner';
import ErrorBanner from '@/components/ui/error-banner';
import { SkeletonList } from '@/components/ui/skeleton-list';
import MonthPicker from '@/components/ui/month-picker';
import DailyLoginTable from '@/components/user-analytics/daily-login-table';
import MonthlyUsersTable from '@/components/user-analytics/monthly-users-table';
import { triggerFileDownload } from '@/lib/download/trigger-file-download';
import { constructQueryString } from '@/lib/network/construct-query-string';
import { networkErrorMessage } from '@/lib/network/network-error';
import { Download, Loader2 } from 'lucide-react';
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
    const [isExporting, setIsExporting] = useState(false);
    const [exportError, setExportError] = useState<string | null>(null);

    const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd');

    const { data: getAuthEventsResult, isPending } = useGetUserAuthEvents(
        {
            eventType: 'login',
            programId,
            startDate,
            endDate,
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

    async function handleExport() {
        setIsExporting(true);
        setExportError(null);

        try {
            const queryString = constructQueryString(
                { startDate, endDate, programId },
                getUserAuthEventsReportQueryParamsSchema,
            );

            const response = await fetch(
                `/api/users/auth-events/report${queryString}`,
                { method: 'GET', credentials: 'include' },
            );

            if (!response.ok) {
                setExportError(t('exportError'));
                return;
            }

            await triggerFileDownload(
                response,
                `user-auth-events-report-${startDate}-to-${endDate}.xlsx`,
            );
        } catch {
            setExportError(t('exportError'));
        } finally {
            setIsExporting(false);
        }
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
