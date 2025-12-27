import { useState, useMemo } from 'react';
import { useUserPermissionsQuery, canPushSites } from '@/features/user';
import { useDhis2SyncMutation } from './use-dhis2-sync';
import { showSuccessToast } from '@/shared/ui/show-success-toast';
import { showErrorToast } from '@/shared/ui/show-error-toast';
import {
  extractDhis2SyncSummary,
  getUniqueVillagesForDistrict,
} from '@/features/review/utils/dhis2-sync';
import type {
  VillageIrsFormData,
  SiteIrsData,
} from '@/features/review/types/dhis2-sync';

interface UseDhis2SyncHandlerParams {
  district: string;
  year: number;
  month: number;
}

export function useDhis2SyncHandler({
  district,
  year,
  month,
}: UseDhis2SyncHandlerParams) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { data: permissions } = useUserPermissionsQuery();
  const canSync = permissions ? canPushSites(permissions) : false;

  const uniqueVillages = useMemo(
    () => getUniqueVillagesForDistrict(permissions, district),
    [permissions, district],
  );

  const { mutateAsync: triggerSync, isPending: isSyncing } =
    useDhis2SyncMutation({
      onSuccess: data => {
        const summary = extractDhis2SyncSummary(data);
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
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to sync with DHIS2';
        showErrorToast(errorMessage);
      },
    });

  const handleSyncSubmit = (villageData: VillageIrsFormData[]) => {
    if (!permissions?.sites?.canAccessSites) return;

    const villageToIrsMap = new Map(
      villageData.map(v => [v.villageName, v]),
    );

    const irsData: SiteIrsData[] = permissions.sites.canAccessSites
      .filter(
        site =>
          site.villageName &&
          site.district === district &&
          villageToIrsMap.has(site.villageName),
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

    setDialogOpen(false);

    triggerSync({
      district,
      year,
      month,
      dryRun: false,
      irsData,
    });
  };

  const handleSyncButtonClick = () => {
    setDialogOpen(true);
  };

  return {
    dialogOpen,
    setDialogOpen,
    canSync,
    uniqueVillages,
    isSyncing,
    handleSyncSubmit,
    handleSyncButtonClick,
  };
}

