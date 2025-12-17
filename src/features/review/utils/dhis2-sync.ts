import type { SiteDto } from '@/shared/entities/site/dto';
import type { UserPermissions } from '@/shared/entities/user/model';

export interface Dhis2SyncSummary {
  totalHouseholds: number;
  successfulSyncs: number;
  failedSyncs: number;
  skippedHouseholds: number;
}

export function extractDhis2SyncSummary(
  payload: unknown,
): Dhis2SyncSummary | null {
  if (!payload || typeof payload !== 'object') return null;

  const summary = (payload as Record<string, unknown>).summary;
  if (!summary || typeof summary !== 'object') return null;

  const {
    totalHouseholds,
    successfulSyncs,
    failedSyncs,
    skippedHouseholds,
  } = summary as Record<string, unknown>;

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
}

export function getUniqueVillagesForDistrict(
  permissions: UserPermissions | undefined,
  district: string,
): string[] {
  if (!permissions?.sites?.canAccessSites) return [];

  const villages = new Set<string>();
  permissions.sites.canAccessSites.forEach(site => {
    if (site.villageName && site.district === district) {
      villages.add(site.villageName);
    }
  });

  return Array.from(villages).sort();
}

