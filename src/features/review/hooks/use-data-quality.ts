import { useMemo } from 'react';
import { useSessionsBySiteQuery } from '@/features/review/hooks/use-sessions-by-site';
import { useSurveillanceFormsQuery } from '@/features/review/hooks/use-surveillance-forms';
import { collectDiscrepanciesForSite } from '@/features/review/utils/data-quality';
import {
  getMonthDateRange,
  formatSiteLabel,
} from '@/features/review/utils/master-table-view';
import type {
  DataQualitySummary,
  MissingSiteSummary,
  SiteDiscrepancySummary,
} from '@/features/review/types';
import { useUserPermissionsQuery } from '@/features/user';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';

export function useDataQualitySummary({
  district,
  monthYear,
}: {
  district: string;
  monthYear: string;
}): DataQualitySummary {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);

  const { startDate, endDate } =
    getMonthDateRange(decodedMonthYear) ??
    ({ startDate: undefined, endDate: undefined } as const);

  const { data: permissions, isLoading: isPermissionsLoading } =
    useUserPermissionsQuery();

  const normalizedDistrict = decodedDistrict.toLowerCase();
  const accessibleSites = useMemo(
    () =>
      (permissions?.sites?.canAccessSites ?? []).filter(
        site => site.district?.toLowerCase() === normalizedDistrict,
      ),
    [permissions, normalizedDistrict],
  );

  const { data: sessionsBySite, isLoading: isSessionsLoading } =
    useSessionsBySiteQuery(
      {
        district: decodedDistrict,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
      },
      {
        enabled:
          Boolean(decodedDistrict && startDate && endDate) &&
          !isPermissionsLoading,
      },
    );

  const allSessionIds = useMemo(
    () =>
      sessionsBySite?.flatMap(group =>
        group.sessions.map(session => session.sessionId),
      ) ?? [],
    [sessionsBySite],
  );

  const {
    data: surveillanceForms,
    isLoading: isSurveillanceFormsLoading,
    isError: isSurveillanceFormsError,
  } = useSurveillanceFormsQuery(allSessionIds, {
    enabled: allSessionIds.length > 0,
  });

  const accessibleSiteLookup = useMemo(
    () => new Map(accessibleSites.map(site => [site.siteId, site])),
    [accessibleSites],
  );

  const siteDiscrepancies: SiteDiscrepancySummary[] = useMemo(() => {
    if (!sessionsBySite?.length) return [];

    const awaitingForms =
      allSessionIds.length > 0 &&
      (isSurveillanceFormsLoading ||
        isSurveillanceFormsError ||
        !surveillanceForms);

    if (awaitingForms) {
      return [];
    }

    const formsMap = surveillanceForms ?? new Map<number, SurveillanceForm>();

    return sessionsBySite
      .map(siteGroup => {
        const siteInfo = accessibleSiteLookup.get(siteGroup.siteId);
        const siteLabel = siteInfo
          ? formatSiteLabel(siteInfo)
          : { topLine: `Site #${siteGroup.siteId}`, bottomLine: null };
        const fields = collectDiscrepanciesForSite(siteGroup, formsMap);

        return {
          siteId: siteGroup.siteId,
          sessionCount: siteGroup.sessions.length,
          sessionIds: siteGroup.sessions.map(s => s.sessionId),
          siteLabel,
          fields,
        };
      })
      .filter(site => site.fields.length > 0)
      .sort((a, b) => {
        const diff = b.fields.length - a.fields.length;
        return diff !== 0 ? diff : a.siteId - b.siteId;
      });
  }, [
    sessionsBySite,
    surveillanceForms,
    accessibleSiteLookup,
    isSurveillanceFormsLoading,
    isSurveillanceFormsError,
    allSessionIds.length,
  ]);

  const siteIdsWithSessions = useMemo(
    () => new Set((sessionsBySite ?? []).map(group => group.siteId)),
    [sessionsBySite],
  );

  const missingSites: MissingSiteSummary[] = useMemo(
    () =>
      accessibleSites
        .filter(site => !siteIdsWithSessions.has(site.siteId))
        .map(site => ({
          site,
          display: [
            site.villageName?.trim(),
            site.houseNumber?.trim()
              ? `House ${site.houseNumber.trim()}`
              : null,
          ]
            .filter(Boolean)
            .join(', ')
            .trim(),
        }))
        .sort((a, b) => {
          const aLabel = a.display || `Site ${a.site.siteId}`;
          const bLabel = b.display || `Site ${b.site.siteId}`;
          return aLabel.localeCompare(bLabel);
        }),
    [accessibleSites, siteIdsWithSessions],
  );

  return {
    siteDiscrepancies,
    missingSites,
    isLoading:
      isPermissionsLoading || isSessionsLoading || isSurveillanceFormsLoading,
  };
}
