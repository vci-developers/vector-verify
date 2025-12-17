'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/ui/card';
import { Button } from '@/ui/button';
import { useDashboardDataQuery } from '@/features/review/hooks';
import { useDhis2SyncMutation } from '@/features/review/hooks/use-dhis2-sync';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import { SiteInformationSection } from './site-information-section';
import { EntomologicalSummarySection } from './entomological-summary-section';
import { BednetsDataSection } from './bednets-data-section';
import { DashboardLoadingSkeleton } from './loading-skeleton';
import { DashboardSidebar } from './sidebar';
import {
  useUserPermissionsQuery,
  canPushSites,
} from '@/features/user';
import { showSuccessToast } from '@/shared/ui/show-success-toast';
import { showErrorToast } from '@/shared/ui/show-error-toast';
import { Dhis2SyncDialog } from '@/features/review/components/review-dashboard/dhis2-sync-dialog';
import type { VillageIrsFormData, SiteIrsData } from '@/features/review/types/dhis2-sync';

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
  const monthNum = Number.parseInt(monthString, 10);
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data: permissions } = useUserPermissionsQuery();
  const canSync = permissions ? canPushSites(permissions) : false;

  const { data, isLoading, error } = useDashboardDataQuery({
    district,
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
  });

  const monthName = useMemo(() => {
    return new Date(year, monthNum - 1, 1).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  }, [year, monthNum]);

  const sidebarLayout = (
    <div className="flex min-h-screen bg-white overflow-hidden">
      <DashboardSidebar district={district} monthYear={monthYear} />
      <div className="flex-1 min-w-0">
        <div className="px-12 py-8 pb-12">
          {isLoading && <DashboardLoadingSkeleton />}
          {error && (
  const uniqueVillages = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];

    const villages = new Set<string>();
    permissions.sites.canAccessSites.forEach(site => {
      if (site.villageName && site.district === district) {
        villages.add(site.villageName);
      }
    });

    return Array.from(villages).sort();
  }, [permissions?.sites?.canAccessSites, district]);

  const extractSummary = (payload: unknown) => {
    if (!payload || typeof payload !== 'object') return null;
    const summary = (payload as Record<string, unknown>).summary;
    if (!summary || typeof summary !== 'object') return null;
    const { totalHouseholds, successfulSyncs, failedSyncs, skippedHouseholds } =
      summary as Record<string, unknown>;
    if (
      [totalHouseholds, successfulSyncs, failedSyncs, skippedHouseholds].every(
        value => typeof value === 'number',
      )
    ) {
      return {
        totalHouseholds: totalHouseholds as number,
        successfulSyncs: successfulSyncs as number,
        failedSyncs: failedSyncs as number,
        skippedHouseholds: skippedHouseholds as number,
      };
    }
    return null;
  };

  const { mutateAsync: triggerSync, isPending: isSyncing } = useDhis2SyncMutation({
    onSuccess: data => {
      const summary = extractSummary(data);
      if (summary) {
        showSuccessToast(
          `DHIS2 sync processed ${summary.totalHouseholds} household${
            summary.totalHouseholds === 1 ? '' : 's'
          }: ${summary.successfulSyncs} succeeded, ${summary.failedSyncs} failed, ${summary.skippedHouseholds} skipped.`,
        );
        return;
      }
      showSuccessToast(
        'DHIS2 sync started. You will receive a notification when it finishes.',
      );
    },
    onError: error => {
      console.error('DHIS2 sync error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to sync with DHIS2';
      showErrorToast(errorMessage);
    },
  });

  const handleSyncSubmit = (villageData: VillageIrsFormData[]) => {
    if (!permissions?.sites?.canAccessSites) return;

    const villageToIrsMap = new Map(
      villageData.map(v => [v.villageName, v])
    );

    const irsData: SiteIrsData[] = permissions.sites.canAccessSites
      .filter(site =>
        site.villageName &&
        site.district === district &&
        villageToIrsMap.has(site.villageName)
      )
      .map(site => {
        const villageIrs = villageToIrsMap.get(site.villageName!)!;
        if (!villageIrs.wasIrsSprayed) {
          return {
            siteId: site.siteId,
            wasIrsSprayed: false,
          } satisfies SiteIrsData;
        }
        return {
          siteId: site.siteId,
          wasIrsSprayed: true,
          insecticideSprayed: villageIrs.insecticideSprayed,
          dateLastSprayed: villageIrs.dateLastSprayed,
        } satisfies SiteIrsData;
      });

    console.log('Submitting DHIS2 sync with IRS data:', {
      district,
      year,
      month: monthNum,
      irsDataCount: irsData.length,
      irsData,
    });

    setDialogOpen(false);

    triggerSync({
      district,
      year,
      month: monthNum,
      dryRun: false,
      irsData,
    });
  };

  const handleSyncButtonClick = () => {
    setDialogOpen(true);
  };

  if (isLoading) {
    return <DashboardLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-red-600">
                Error Loading Dashboard
              </h2>
              <p className="text-gray-600">
                {error?.message || 'An unexpected error occurred'}
              </p>
            </div>
          </CardContent>
        </Card>
          )}
          {!data && !isLoading && !error && (
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <h2 className="mb-2 text-lg font-semibold text-gray-600">
                No Data Available
              </h2>
              <p className="text-gray-500">
                No data found for {district} in {monthName}
              </p>
            </div>
          </CardContent>
        </Card>
          )}
        </div>
      </div>
      </div>
    );

  if (isLoading || error || !data) {
    return sidebarLayout;
  }

  return (
    <div className="flex min-h-screen bg-white">
      <DashboardSidebar district={district} monthYear={monthYear} />
      <div className="flex-1 min-w-0">
        <div className="px-12 py-8 pb-24">
          <div className="mb-4">
          <h1 className="text-4xl font-bold text-gray-800">{district}</h1>
            <p className="mt-2 text-lg" style={{ color: '#98a3b2' }}>{monthName}</p>
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">{district}</h1>
            <p className="mt-2 text-lg text-gray-600">{monthName}</p>
          </div>
          <div className="flex flex-col items-start gap-2 md:items-end">
            <Button
              className="bg-chart-green-medium text-white shadow-xs hover:bg-chart-green-dark focus-visible:border-chart-green-medium focus-visible:ring-chart-green-medium/40"
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

          <div className="h-px bg-gray-200 mb-6"></div>

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
