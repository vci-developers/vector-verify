'use client';

import React, { useMemo, useState } from 'react';
import type { Session } from '@/shared/entities/session/model';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';
import {
  getMonthDateRange,
  groupColumnsBySpecies,
  getSiteLabel,
  formatSiteLabel,
} from '@/features/review/utils/master-table-view';
import { useSpecimenCountsQuery } from '@/features/review/hooks/use-specimen-counts';
import {
  useSessionsBySiteQuery,
  type SessionsBySite,
} from '@/features/review/hooks/use-sessions-by-site';
import { useSurveillanceFormsQuery } from '@/features/review/hooks/use-surveillance-forms';
import { MasterTableViewLoadingSkeleton } from './loading-skeleton';
import { MosquitoCountsTable } from './mosquito-counts-table';
import { HouseholdInfoTable } from './household-info-table';
import type {
  MosquitoTableMeta,
  HouseholdTableMeta,
} from '@/features/review/types';
import { ToggleGroup, ToggleGroupItem } from '@/ui/toggle-group';
import { useUserPermissionsQuery } from '@/features/user';

interface MasterTableViewPageClientProps {
  district: string;
  monthYear: string;
}

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-');
  return new Date(
    Number.parseInt(year, 10),
    Number.parseInt(month, 10) - 1,
  ).toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });
}

export function MasterTableViewPageClient({
  district,
  monthYear,
}: MasterTableViewPageClientProps) {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);

  const [viewMode, setViewMode] = useState<'mosquito' | 'household'>(
    'mosquito',
  );

  const dateRange = getMonthDateRange(decodedMonthYear);
  const startDate = dateRange?.startDate ?? undefined;
  const endDate = dateRange?.endDate ?? undefined;

  const { data: specimenCounts, isLoading: isSpecimenCountsLoading } =
    useSpecimenCountsQuery({
      district: decodedDistrict,
      monthYear: decodedMonthYear,
    });

  const { data: sessionsBySite, isLoading: isSessionsLoading } =
    useSessionsBySiteQuery(
      {
        district: decodedDistrict,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
      },
      {
        enabled: viewMode === 'household' && Boolean(startDate && endDate),
      },
    );

  const allSessionIds = useMemo(() => {
    if (!sessionsBySite) return [];
    return sessionsBySite.flatMap(group =>
      group.sessions.map(s => s.sessionId),
    );
  }, [sessionsBySite]);

  const { data: surveillanceForms, isLoading: isSurveillanceFormsLoading } =
    useSurveillanceFormsQuery(allSessionIds, {
      enabled: viewMode === 'household' && allSessionIds.length > 0,
    });

  const { data: permissions } = useUserPermissionsQuery();

  const monthLabel = useMemo(
    () => formatMonthLabel(decodedMonthYear),
    [decodedMonthYear],
  );

  const mosquitoTableMeta = useMemo(() => {
    if (!specimenCounts?.data?.length) return null;

    const sites = specimenCounts.data;
    const columns = specimenCounts.columns?.filter(Boolean) || [
      ...new Set(
        sites.flatMap(site =>
          site.counts.map(c => c.columnName).filter(Boolean),
        ),
      ),
    ];

    if (!columns.length) return null;

    const groupedColumns = groupColumnsBySpecies(columns);

    const accessibleSites = permissions?.sites?.canAccessSites ?? [];
    const siteLookup = new Map(
      accessibleSites.map(site => [site.siteId, site]),
    );

    const rows = sites.map((site, index) => {
      const countsByColumn = site.counts.reduce<Record<string, number>>(
        (acc, count) => {
          if (count.columnName) {
            acc[count.columnName] =
              (acc[count.columnName] || 0) + (count.count || 0);
          }
          return acc;
        },
        {},
      );

      const siteInfo = siteLookup.get(site.siteId);
      const siteLabel = siteInfo
        ? formatSiteLabel(siteInfo)
        : getSiteLabel(site);

      return {
        key: site.siteId?.toString() || `site-${index}`,
        label: siteLabel,
        countsByColumn,
        totalSpecimens: site.totalSpecimens,
      };
    });

    const totals = columns.reduce<Record<string, number>>((acc, column) => {
      acc[column] = rows.reduce(
        (sum, row) => sum + (row.countsByColumn[column] || 0),
        0,
      );
      return acc;
    }, {});

    const grandTotal = rows.reduce(
      (sum, row) => sum + (row.totalSpecimens || 0),
      0,
    );

    const meta: MosquitoTableMeta = {
      groupedColumns,
      rows,
      totals,
      grandTotal,
      minWidth: Math.max(640, 220 + columns.length * 140),
    };
    return meta;
  }, [
    specimenCounts?.data,
    specimenCounts?.columns,
    permissions?.sites?.canAccessSites,
  ]);

  const householdTableMeta = useMemo(() => {
    if (!specimenCounts?.data?.length) return null;

    const accessibleSites = permissions?.sites?.canAccessSites ?? [];
    const siteLookup = new Map(
      accessibleSites.map(site => [site.siteId, site]),
    );
    const hasPermissions = siteLookup.size > 0;

    const sessionsBySiteMap = new Map<number, SessionsBySite>();
    if (sessionsBySite) {
      sessionsBySite.forEach(group => {
        sessionsBySiteMap.set(group.siteId, group);
      });
    }

    const rows = specimenCounts.data
      .filter(site => !hasPermissions || siteLookup.has(site.siteId))
      .map(site => {
        const siteInfo = siteLookup.get(site.siteId);
        const siteLabel = siteInfo
          ? formatSiteLabel(siteInfo)
          : getSiteLabel(site);

        const siteGroup = sessionsBySiteMap.get(site.siteId);
        const sessions = siteGroup?.sessions || [];

        const collectorNames = Array.from(
          new Set(
            sessions
              .map((s: Session) => s.collectorName)
              .filter((name): name is string => Boolean(name)),
          ),
        );
        const collectorTitles = Array.from(
          new Set(
            sessions
              .map((s: Session) => s.collectorTitle)
              .filter((title): title is string => Boolean(title)),
          ),
        );
        const collectionMethods = Array.from(
          new Set(
            sessions
              .map((s: Session) => s.collectionMethod)
              .filter((method): method is string => Boolean(method)),
          ),
        );

        const mostRecentDate = sessions.reduce<number | null>(
          (latest: number | null, session: Session) => {
            if (!session.collectionDate) return latest;
            if (!latest) return session.collectionDate;
            return session.collectionDate > latest
              ? session.collectionDate
              : latest;
          },
          null,
        );

        const forms = sessions
          .map(s => surveillanceForms?.get(s.sessionId))
          .filter((f): f is SurveillanceForm => Boolean(f));

        const numPeopleSleptInHouse = forms.map(f => f.numPeopleSleptInHouse);
        const wasIrsConducted = forms.map(f => f.wasIrsConducted);
        const monthsSinceIrs = forms.map(f => f.monthsSinceIrs);
        const numLlinsAvailable = forms.map(f => f.numLlinsAvailable);
        const llinType = forms.map(f => f.llinType);
        const llinBrand = forms.map(f => f.llinBrand);
        const numPeopleSleptUnderLlin = forms.map(
          f => f.numPeopleSleptUnderLlin,
        );

        const hasDiscrepancy = <T,>(values: (T | null)[]) => {
          const uniqueNonNull = Array.from(
            new Set(values.filter((v): v is T => v !== null)),
          );
          return uniqueNonNull.length > 1;
        };

        const hasIrsDiscrepancy = hasDiscrepancy(wasIrsConducted);

        return {
          key: `site-${site.siteId}`,
          siteLabel,
          collectorName: collectorNames.length === 1 ? collectorNames[0] : null,
          collectorTitle:
            collectorTitles.length === 1 ? collectorTitles[0] : null,
          collectionMethod:
            collectionMethods.length === 1 ? collectionMethods[0] : null,
          mostRecentDate,
          sessionCount: sessions.length,
          hasCollectorNameDiscrepancy: collectorNames.length > 1,
          hasCollectorTitleDiscrepancy: collectorTitles.length > 1,
          hasCollectionMethodDiscrepancy: collectionMethods.length > 1,
          collectorNames,
          collectorTitles,
          collectionMethods,
          numPeopleSleptInHouse,
          wasIrsConducted,
          monthsSinceIrs,
          numLlinsAvailable,
          llinType,
          llinBrand,
          numPeopleSleptUnderLlin,
          hasNumPeopleSleptInHouseDiscrepancy: hasDiscrepancy(
            numPeopleSleptInHouse,
          ),
          hasWasIrsConductedDiscrepancy: hasIrsDiscrepancy,
          hasMonthsSinceIrsDiscrepancy:
            hasIrsDiscrepancy || hasDiscrepancy(monthsSinceIrs),
          hasNumLlinsAvailableDiscrepancy: hasDiscrepancy(numLlinsAvailable),
          hasLlinTypeDiscrepancy: hasDiscrepancy(llinType),
          hasLlinBrandDiscrepancy: hasDiscrepancy(llinBrand),
          hasNumPeopleSleptUnderLlinDiscrepancy: hasDiscrepancy(
            numPeopleSleptUnderLlin,
          ),
        };
      });

    const meta: HouseholdTableMeta = {
      rows,
      minWidth: 2200,
    };
    return meta;
  }, [
    specimenCounts?.data,
    sessionsBySite,
    surveillanceForms,
    permissions?.sites?.canAccessSites,
  ]);

  const isLoading =
    (viewMode === 'mosquito' && isSpecimenCountsLoading) ||
    (viewMode === 'household' &&
      (isSessionsLoading || isSurveillanceFormsLoading));

  if (isLoading) {
    return <MasterTableViewLoadingSkeleton />;
  }

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <header className="flex items-end justify-between gap-4 border-b pb-4">
        <div>
          <p className="text-muted-foreground text-xs tracking-wide uppercase">
            DHIS2 Review
          </p>
          <h1 className="text-3xl font-semibold">{decodedDistrict}</h1>
          <p className="text-muted-foreground text-sm">
            {monthLabel}
            {dateRange && (
              <span>{` • ${dateRange.startDate ?? '—'} – ${dateRange.endDate ?? '—'}`}</span>
            )}
          </p>
        </div>
        {viewMode === 'mosquito' && mosquitoTableMeta && (
          <div className="text-muted-foreground text-sm">
            <span className="text-2xl font-semibold">
              {mosquitoTableMeta.rows.length.toLocaleString()}
            </span>{' '}
            site{mosquitoTableMeta.rows.length === 1 ? '' : 's'} in view
          </div>
        )}
        {viewMode === 'household' && householdTableMeta && (
          <div className="text-muted-foreground text-sm">
            <span className="text-2xl font-semibold">
              {householdTableMeta.rows.length.toLocaleString()}
            </span>{' '}
            site{householdTableMeta.rows.length === 1 ? '' : 's'} in view
          </div>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-foreground text-2xl font-semibold">
                Master Table View
              </h2>
              <p className="text-muted-foreground text-sm">
                Switch between mosquito counts and household information.
              </p>
            </div>
            <ToggleGroup
              type="single"
              value={viewMode}
              spacing={0}
              variant="outline"
              onValueChange={nextValue => {
                if (typeof nextValue !== 'string') return;
                setViewMode(nextValue as 'mosquito' | 'household');
              }}
            >
              <ToggleGroupItem
                value="mosquito"
                className="data-[state=off]:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-none px-5 py-2 text-sm font-medium"
              >
                Mosquito Counts
              </ToggleGroupItem>
              <ToggleGroupItem
                value="household"
                className="data-[state=off]:bg-muted data-[state=on]:bg-primary data-[state=on]:text-primary-foreground rounded-none px-5 py-2 text-sm font-medium"
              >
                Household Info
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>

        {viewMode === 'mosquito' && (
          <MosquitoCountsTable
            tableMeta={mosquitoTableMeta}
            specimenCounts={specimenCounts}
          />
        )}

        {viewMode === 'household' && (
          <HouseholdInfoTable tableMeta={householdTableMeta} />
        )}
      </section>
    </div>
  );
}
