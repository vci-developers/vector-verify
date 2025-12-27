'use client';

import { useMemo } from 'react';
import { useDashboardDataQuery } from '@/features/review/hooks';
import { useDhis2SyncHandler } from '@/features/review/hooks/use-dhis2-sync-handler';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { formatMonthName } from '@/features/review/utils/dashboard';
import { SiteInformationSection } from './site-information-section';
import { EntomologicalSummarySection } from './entomological-summary-section';
import { BednetsDataSection } from './bednets-data-section';
import { DashboardLoadingSkeleton } from './loading-skeleton';
import { DashboardSidebar } from './sidebar';
import { ErrorState } from './error-state';
import { EmptyState } from './empty-state';
import { DashboardHeader } from './dashboard-header';

interface DashboardPageClientProps {
  district: string;
  monthYear: string;
}

export function DashboardPageClient({
  district,
  monthYear,
}: DashboardPageClientProps) {
  const dateRange = getMonthDateRange(monthYear);
  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;

  const [yearString, monthString] = monthYear.split('-');
  const year = Number.parseInt(yearString, 10);
  const month = Number.parseInt(monthString, 10);

  const { data, isLoading, error } = useDashboardDataQuery({
    district,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  });

  const monthName = useMemo(() => formatMonthName(year, month), [year, month]);

  const {
    dialogOpen,
    setDialogOpen,
    canSync,
    uniqueVillages,
    isSyncing,
    handleSyncSubmit,
    handleSyncButtonClick,
  } = useDhis2SyncHandler({ district, year, month });

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return <ErrorState message={error?.message} />;
  }

  if (!data) {
    return <EmptyState district={district} monthName={monthName} />;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar district={district} monthYear={monthYear} />
      <div className="min-w-0 flex-1">
        <div className="px-12 py-8 pb-24">
          <DashboardHeader
            district={district}
            monthName={monthName}
            canSync={canSync}
            isSyncing={isSyncing}
            onSyncButtonClick={handleSyncButtonClick}
            dialogOpen={dialogOpen}
            onDialogOpenChange={setDialogOpen}
            villages={uniqueVillages}
            onSyncSubmit={handleSyncSubmit}
          />

          <div className="space-y-8">
            <SiteInformationSection
              data={data.siteInformation}
              vectorDensity={data.entomologicalSummary.vectorDensity}
            />

            <EntomologicalSummarySection metrics={data} />

            <BednetsDataSection data={data.entomologicalSummary} />
          </div>
        </div>
      </div>
    </div>
  );
}
