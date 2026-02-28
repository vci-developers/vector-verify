'use client';

import { useDashboardDataQuery } from '@/features/review/hooks';
import { useDhis2SyncHandler } from '@/features/review/hooks/use-dhis2-sync-handler';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { formatMonthName } from '@/shared/core/utils/date';
import { SiteInformationSection } from './site-information-section';
import { EntomologicalSummarySection } from './entomological-summary-section';
import { BednetsDataSection } from './bednets-data-section';
import { DashboardLoadingSkeleton } from './loading-skeleton';
import { ErrorState } from './error-state';
import { EmptyState } from './empty-state';
import { Dhis2SyncDialog } from '@/features/review/components/review-dashboard/dhis2-sync-dialog';
import { Button } from '@/ui/button';

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

  const monthName = formatMonthName(year, month);

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
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-12 py-8">
          <DashboardLoadingSkeleton />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-12 py-8">
          <ErrorState message={error?.message} />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-12 py-8">
          <EmptyState district={district} monthName={monthName} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-12 py-8 pb-24">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{district}</h1>
            <div className="mt-2 flex flex-col gap-1">
              <p className="text-lg text-gray-600">{monthName}</p>
              <div className="flex gap-4 text-sm text-gray-500">
                <span>
                  Total mosquitoes:{' '}
                  <span className="font-semibold text-gray-700">
                    {data.totalMosquitoes}
                  </span>
                </span>
                <span>
                  Total anopheles:{' '}
                  <span className="font-semibold text-gray-700">
                    {data.totalAnopheles}
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Button
              className="bg-chart-green-medium hover:bg-chart-green-dark focus-visible:border-chart-green-medium focus-visible:ring-chart-green-medium/40 text-white shadow-xs"
              onClick={handleSyncButtonClick}
              disabled={isSyncing || !canSync}
            >
              {isSyncing ? 'Syncing with DHIS2…' : 'Sync to DHIS2'}
            </Button>
            {!canSync && (
              <p className="text-muted-foreground text-xs md:text-right">
                You do not have permission to push metadata.
              </p>
            )}
          </div>
        </div>

        <div className="mb-6 h-px bg-gray-200" />

        <div className="space-y-8">
          <SiteInformationSection
            data={data.siteInformation}
            vectorDensity={data.entomologicalSummary.vectorDensity}
          />

          <EntomologicalSummarySection metrics={data} />

          <BednetsDataSection data={data.entomologicalSummary} />
        </div>
      </div>

      <Dhis2SyncDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        villages={uniqueVillages}
        onSubmit={handleSyncSubmit}
        isSubmitting={isSyncing}
      />
    </div>
  );
}
