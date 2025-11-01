import { useMemo } from 'react';

import { useSessionsBySiteQuery } from '@/features/review/hooks/use-sessions-by-site';
import type { SessionsBySite } from '@/features/review/hooks/use-sessions-by-site';
import { useSurveillanceFormsQuery } from '@/features/review/hooks/use-surveillance-forms';
import { getMonthDateRange, formatSiteLabel } from '@/features/review/utils/master-table-view';
import { useUserPermissionsQuery } from '@/features/user';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';
import type { Site } from '@/shared/entities/site/model';

export type DiscrepancyFieldKey =
  | 'collectorName'
  | 'collectorTitle'
  | 'collectionMethod'
  | 'numPeopleSleptInHouse'
  | 'wasIrsConducted'
  | 'monthsSinceIrs'
  | 'numLlinsAvailable'
  | 'llinType'
  | 'llinBrand'
  | 'numPeopleSleptUnderLlin';

export interface DiscrepancyField {
  key: DiscrepancyFieldKey;
  label: string;
  details: string;
}

export interface SiteDiscrepancySummary {
  siteId: number;
  sessionCount: number;
  siteLabel: { topLine: string; bottomLine: string | null };
  fields: DiscrepancyField[];
}

export interface MissingSiteSummary {
  site: Site;
  display: string;
}

interface UseDataQualitySummaryParams {
  district: string;
  monthYear: string;
}

interface UseDataQualitySummaryResult {
  siteDiscrepancies: SiteDiscrepancySummary[];
  missingSites: MissingSiteSummary[];
  isLoading: boolean;
}

function uniqueNonNull<T>(values: (T | null | undefined)[]) {
  return Array.from(
    new Set(values.filter((value): value is T => value !== null && value !== undefined)),
  );
}

function uniqueStringValues(values: (string | null | undefined)[]) {
  return Array.from(
    new Set(
      values
        .map(value => (typeof value === 'string' ? value.trim() : value))
        .filter((value): value is string => Boolean(value && value.length > 0)),
    ),
  );
}

function formatValueList(values: (string | number | boolean)[]) {
  if (values.length === 0) {
    return 'Not recorded';
  }

  return values
    .map(value => {
      if (typeof value === 'boolean') {
        return value ? 'Yes' : 'No';
      }
      if (typeof value === 'number') {
        return Number.isFinite(value) ? value.toString() : '—';
      }
      return value;
    })
    .join(' • ');
}

function formatMonthsSinceIrsConflict(
  forms: SurveillanceForm[],
): string[] {
  const yesForms = forms.filter(form => form.wasIrsConducted === true);
  const noForms = forms.filter(form => form.wasIrsConducted === false);

  const yesValues = uniqueNonNull(
    yesForms.map(form => form.monthsSinceIrs),
  );

  const segments: string[] = [];

  if (yesForms.length > 0) {
    if (yesValues.length === 0) {
      segments.push('Yes: Not recorded');
    } else {
      segments.push(
        `Yes: ${yesValues
          .map(value => (Number.isFinite(value) ? `${value}` : 'Not recorded'))
          .join(', ')}`,
      );
    }
  }

  if (noForms.length > 0) {
    segments.push('No: N/A');
  }

  return segments;
}

function collectDiscrepanciesForSite(
  siteGroup: SessionsBySite,
  formsMap: Map<number, SurveillanceForm>,
): DiscrepancyField[] {
  const sessions = siteGroup.sessions;

  const collectorNames = uniqueStringValues(
    sessions.map(session => session.collectorName),
  );
  const collectorTitles = uniqueStringValues(
    sessions.map(session => session.collectorTitle),
  );
  const collectionMethods = uniqueStringValues(
    sessions.map(session => session.collectionMethod),
  );

  const forms = sessions
    .map(session => formsMap.get(session.sessionId))
    .filter((form): form is SurveillanceForm => Boolean(form));

  const numPeopleSleptInHouse = uniqueNonNull(
    forms.map(form => form.numPeopleSleptInHouse),
  );
  const wasIrsConducted = uniqueNonNull(
    forms.map(form => form.wasIrsConducted),
  );
  const monthsSinceIrs = uniqueNonNull(forms.map(form => form.monthsSinceIrs));
  const numLlinsAvailable = uniqueNonNull(
    forms.map(form => form.numLlinsAvailable),
  );
  const llinType = uniqueStringValues(forms.map(form => form.llinType));
  const llinBrand = uniqueStringValues(forms.map(form => form.llinBrand));
  const numPeopleSleptUnderLlin = uniqueNonNull(
    forms.map(form => form.numPeopleSleptUnderLlin),
  );

  const fields: DiscrepancyField[] = [];

  const maybePush = (
    key: DiscrepancyFieldKey,
    label: string,
    values: (string | number | boolean)[],
    shouldInclude: boolean,
    options?: { force?: boolean },
  ) => {
    if (!shouldInclude) return;

    const hasMultipleValues = values.length > 1;
    const shouldForceInclude = options?.force ?? false;

    if (!hasMultipleValues && !shouldForceInclude) {
      return;
    }

    fields.push({
      key,
      label,
      details:
        values.length > 0 ? formatValueList(values) : 'Not recorded',
    });
  };

  maybePush('collectorName', 'Collector Name', collectorNames, collectorNames.length > 1);
  maybePush(
    'collectorTitle',
    'Collector Title',
    collectorTitles,
    collectorTitles.length > 1,
  );
  maybePush(
    'collectionMethod',
    'Collection Method',
    collectionMethods,
    collectionMethods.length > 1,
  );
  maybePush(
    'numPeopleSleptInHouse',
    'People In House',
    numPeopleSleptInHouse,
    numPeopleSleptInHouse.length > 1,
  );

  const hasIrsDiscrepancy = wasIrsConducted.length > 1;
  const hasYesAndNo =
    wasIrsConducted.includes(true) && wasIrsConducted.includes(false);
  const monthsSinceIrsDisplayValues = hasYesAndNo
    ? formatMonthsSinceIrsConflict(forms)
    : monthsSinceIrs;
  maybePush(
    'wasIrsConducted',
    'IRS Conducted',
    wasIrsConducted,
    hasIrsDiscrepancy,
  );

  maybePush(
    'monthsSinceIrs',
    'Months Since IRS',
    monthsSinceIrsDisplayValues,
    hasIrsDiscrepancy || monthsSinceIrs.length > 1,
    { force: hasIrsDiscrepancy },
  );

  maybePush(
    'numLlinsAvailable',
    'LLINs Available',
    numLlinsAvailable,
    numLlinsAvailable.length > 1,
  );
  maybePush('llinType', 'LLIN Type', llinType, llinType.length > 1);
  maybePush('llinBrand', 'LLIN Brand', llinBrand, llinBrand.length > 1);
  maybePush(
    'numPeopleSleptUnderLlin',
    'People Slept Under LLIN',
    numPeopleSleptUnderLlin,
    numPeopleSleptUnderLlin.length > 1,
  );

  return fields;
}

export function useDataQualitySummary({
  district,
  monthYear,
}: UseDataQualitySummaryParams): UseDataQualitySummaryResult {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);

  const startDate = getMonthDateRange(decodedMonthYear)?.startDate ?? undefined;
  const endDate = getMonthDateRange(decodedMonthYear)?.endDate ?? undefined;

  const { data: permissions, isLoading: isPermissionsLoading } =
    useUserPermissionsQuery();

  const accessibleSites = useMemo(() => {
    if (!permissions?.sites?.canAccessSites) return [];
    return permissions.sites.canAccessSites.filter(site => {
      if (!site.district) return false;
      return site.district.toLowerCase() === decodedDistrict.toLowerCase();
    });
  }, [permissions, decodedDistrict]);

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

  const allSessionIds = useMemo(() => {
    if (!sessionsBySite) return [];
    return sessionsBySite.flatMap(group =>
      group.sessions.map(session => session.sessionId),
    );
  }, [sessionsBySite]);

  const { data: surveillanceForms, isLoading: isSurveillanceFormsLoading } =
    useSurveillanceFormsQuery(allSessionIds, {
      enabled: allSessionIds.length > 0,
    });

  const accessibleSiteLookup = useMemo(() => {
    return new Map(accessibleSites.map(site => [site.siteId, site]));
  }, [accessibleSites]);

  const siteDiscrepancies = useMemo(() => {
    if (!sessionsBySite?.length) return [];
    const formsMap = surveillanceForms ?? new Map<number, SurveillanceForm>();

    return sessionsBySite
      .map(siteGroup => {
        const siteInfo = accessibleSiteLookup.get(siteGroup.siteId);
        const siteLabel = siteInfo
          ? formatSiteLabel(siteInfo)
          : {
              topLine: `Site #${siteGroup.siteId}`,
              bottomLine: null,
            };

        const fields = collectDiscrepanciesForSite(siteGroup, formsMap);

        return {
          siteId: siteGroup.siteId,
          sessionCount: siteGroup.sessions.length,
          siteLabel,
          fields,
        };
      })
      .filter(site => site.fields.length > 0)
      .sort((a, b) => {
        const diff = b.fields.length - a.fields.length;
        if (diff !== 0) return diff;
        return a.siteId - b.siteId;
      });
  }, [sessionsBySite, surveillanceForms, accessibleSiteLookup]);

  const siteIdsWithSessions = useMemo(() => {
    if (!sessionsBySite) return new Set<number>();
    return new Set(sessionsBySite.map(group => group.siteId));
  }, [sessionsBySite]);

  const missingSites = useMemo(() => {
    const list = accessibleSites
      .filter(site => !siteIdsWithSessions.has(site.siteId))
      .map(site => ({
        site,
        display: [
          site.villageName?.trim(),
          site.houseNumber?.trim()
            ? `House ${site.houseNumber?.trim()}`
            : null,
        ]
          .filter(Boolean)
          .join(', ')
          .trim(),
      }));

    return list.sort((a, b) => {
      const labelA = a.display || `Site ${a.site.siteId}`;
      const labelB = b.display || `Site ${b.site.siteId}`;
      return labelA.localeCompare(labelB);
    });
  }, [accessibleSites, siteIdsWithSessions]);

  const isLoading =
    isPermissionsLoading || isSessionsLoading || isSurveillanceFormsLoading;

  return {
    siteDiscrepancies,
    missingSites,
    isLoading,
  };
}
