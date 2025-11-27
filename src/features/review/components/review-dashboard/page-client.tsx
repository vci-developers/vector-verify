'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  useUserPermissionsQuery,
  canPushSites,
} from '@/features/user';
import { showSuccessToast } from '@/shared/ui/show-success-toast';
import { showErrorToast } from '@/shared/ui/show-error-toast';
import { useDhis2SyncMutation } from '@/features/review/hooks/use-dhis2-sync';
import { Dhis2SyncDialog } from './dhis2-sync-dialog';
import type { VillageIrsFormData, SiteIrsData } from '@/features/review/types/dhis2-sync';

interface ReviewDashboardPageClientProps {
  district: string;
  monthYear: string;
}

export function ReviewDashboardPageClient({
  district,
  monthYear,
}: ReviewDashboardPageClientProps) {
  const formattedMonth = decodeURIComponent(monthYear);
  const formattedDistrict = decodeURIComponent(district);

  const [year, monthNum] = formattedMonth.split('-');
  const [dialogOpen, setDialogOpen] = useState(false);
  
  const { data: permissions } = useUserPermissionsQuery();
  const canSync = permissions ? canPushSites(permissions) : false;
  const monthName = new Date(
    parseInt(year),
    parseInt(monthNum) - 1,
    1,
  ).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  // Extract unique village names from user's accessible sites
  const uniqueVillages = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];
    
    const villages = new Set<string>();
    permissions.sites.canAccessSites.forEach(site => {
      if (site.villageName && site.district === formattedDistrict) {
        villages.add(site.villageName);
      }
    });
    
    return Array.from(villages).sort();
  }, [permissions?.sites?.canAccessSites, formattedDistrict]);

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

    // Map village-level data to site-level IRS data
    const villageToIrsMap = new Map(
      villageData.map(v => [v.villageName, v])
    );

    const irsData: SiteIrsData[] = permissions.sites.canAccessSites
      .filter(site => 
        site.villageName && 
        site.district === formattedDistrict &&
        villageToIrsMap.has(site.villageName)
      )
      .map(site => {
        const villageIrs = villageToIrsMap.get(site.villageName!)!;
        return {
          siteId: site.siteId,
          wasIrsSprayed: villageIrs.wasIrsSprayed,
          insecticideSprayed: villageIrs.wasIrsSprayed && villageIrs.insecticideSprayed 
            ? villageIrs.insecticideSprayed 
            : null,
          dateLastSprayed: villageIrs.wasIrsSprayed && villageIrs.dateLastSprayed 
            ? villageIrs.dateLastSprayed 
            : null,
        };
      });

    console.log('Submitting DHIS2 sync with IRS data:', { 
      district: formattedDistrict,
      year: Number.parseInt(year, 10),
      month: Number.parseInt(monthNum, 10),
      irsDataCount: irsData.length,
      irsData 
    });

    setDialogOpen(false);
    
    triggerSync({
      district: formattedDistrict,
      year: Number.parseInt(year, 10),
      month: Number.parseInt(monthNum, 10),
      dryRun: false,
      irsData,
    });
  };

  const handleSyncButtonClick = () => {
    setDialogOpen(true);
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-8 text-center">
        <h1 className="text-foreground text-2xl font-semibold">
          Review Dashboard - {formattedDistrict}
        </h1>
        <p className="text-muted-foreground mt-1">{monthName}</p>
        <div className="mt-6 flex flex-col items-center gap-3">
          <Button onClick={handleSyncButtonClick} disabled={isSyncing || !canSync}>
            {isSyncing ? 'Syncing with DHIS2…' : 'Sync to DHIS2'}
          </Button>
          {!canSync && (
            <p className="text-muted-foreground text-xs">
              You do not have permission to push metadata.
            </p>
          )}
        </div>
      </div>

      <div className="flex justify-center">
        <div className="grid w-full max-w-5xl grid-cols-1 gap-8 md:grid-cols-2">
          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">DHIS2 View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access the DHIS2 review interface for this district and month.
              </p>
              <Button asChild className="w-full">
                <Link
                  href={`/review/${district}/${monthYear}/master-table-view`}
                >
                  Go to DHIS2 View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Specimen View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access the specimen review interface for this district and
                month.
              </p>
              <Button asChild className="w-full">
                <Link href={`/review/${district}/${monthYear}/specimen-view`}>
                  Go to Specimen View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Session View</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Access the session review interface for this district and month.
              </p>
              <Button asChild className="w-full">
                <Link href={`/review/${district}/${monthYear}/session-view`}>
                  Go to Session View
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="transition-shadow hover:shadow-md">
            <CardHeader>
              <CardTitle className="text-xl">Data Quality</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Review discrepancies and identify sites with missing household
                data for this period.
              </p>
              <Button asChild className="w-full">
                <Link href={`/review/${district}/${monthYear}/data-quality`}>
                  Go to Data Quality
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
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
