'use client';

import React, { useMemo } from 'react';
import {
  getMonthDateRange,
  useSpecimenCountsQuery,
} from '@/lib/review/review-detail/master-table-view';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { SpecimenCountsSite } from '@/lib/review/review-detail/master-table-view';

interface MasterTableViewPageClientProps {
  district: string;
  monthYear: string;
}

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-');
  return new Date(parseInt(year), parseInt(month) - 1).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  );
}

function getSiteLabel(site: SpecimenCountsSite) {
  const info = site.siteInfo;

  if (!info) {
    return {
      topLine: `Site #${site.siteId}`,
      bottomLine: null,
    };
  }

  const primaryParts = [
    info.villageName,
    info.houseNumber && `House ${info.houseNumber}`,
  ].filter(Boolean);

  const topLine = primaryParts.length
    ? primaryParts.join(' • ')
    : (info.healthCenter ??
      info.parish ??
      info.subCounty ??
      info.district ??
      `Site #${site.siteId}`);

  const secondaryParts = [
    info.healthCenter !== topLine && info.healthCenter,
    !primaryParts.includes(info.parish) && info.parish,
    !primaryParts.includes(info.subCounty) && info.subCounty,
    !primaryParts.includes(info.district) && info.district,
  ].filter(Boolean);

  return {
    topLine,
    bottomLine: secondaryParts.length ? secondaryParts.join(' • ') : null,
  };
}

export function MasterTableViewPageClient({
  district,
  monthYear,
}: MasterTableViewPageClientProps) {
  const decodedDistrict = decodeURIComponent(district);
  const decodedMonthYear = decodeURIComponent(monthYear);

  const dateRange = getMonthDateRange(decodedMonthYear);
  const { data: specimenCounts, isLoading } = useSpecimenCountsQuery({
    district: decodedDistrict,
    monthYear: decodedMonthYear,
  });

  const monthLabel = useMemo(
    () => formatMonthLabel(decodedMonthYear),
    [decodedMonthYear],
  );

  const tableMeta = useMemo(() => {
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

    const rows = sites.map((site, index) => ({
      key: site.siteId || `site-${index}`,
      label: getSiteLabel(site),
      countsByColumn: site.counts.reduce<Record<string, number>>(
        (acc, count) => {
          if (count.columnName) {
            acc[count.columnName] =
              (acc[count.columnName] || 0) + (count.count || 0);
          }
          return acc;
        },
        {},
      ),
    }));

    const totals = rows.reduce<Record<string, number>>((acc, row) => {
      columns.forEach(col => {
        acc[col] = (acc[col] || 0) + (row.countsByColumn[col] || 0);
      });
      return acc;
    }, {});

    return {
      columns,
      rows,
      totals,
      minWidth: Math.max(640, 220 + columns.length * 140),
    };
  }, [specimenCounts]);

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
        {tableMeta && (
          <div className="text-muted-foreground text-sm">
            <span className="text-2xl font-semibold">
              {tableMeta.rows.length.toLocaleString()}
            </span>{' '}
            site{tableMeta.rows.length === 1 ? '' : 's'} in view
          </div>
        )}
      </header>

      <section className="space-y-4">
        <div>
          <h2 className="text-2xl font-semibold">Specimen Counts</h2>
          <p className="text-muted-foreground text-sm">
            Review site-level submissions for the selected district and month.
          </p>
        </div>

        <div className="space-y-3">
          {isLoading && (
            <p className="text-muted-foreground text-sm">
              Loading specimen counts…
            </p>
          )}
          {!isLoading && !specimenCounts && (
            <p className="text-muted-foreground text-sm">
              No specimen count data available for this selection.
            </p>
          )}

          {tableMeta && (
            <div className="max-h-[560px] w-full overflow-auto rounded-xl border shadow-sm">
              <Table
                className="text-sm"
                style={{ minWidth: tableMeta.minWidth }}
              >
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead className="bg-muted sticky top-0 left-0 z-30 min-w-[240px] text-xs uppercase">
                      Site
                    </TableHead>
                    {tableMeta.columns.map(column => (
                      <TableHead
                        key={column}
                        className="bg-muted sticky top-0 z-20 text-right text-xs uppercase"
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableMeta.rows.map(row => (
                    <TableRow key={row.key} className="group">
                      <TableCell className="bg-background group-hover:bg-muted sticky left-0 z-10 align-top shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                        <div className="text-sm font-semibold">
                          {row.label.topLine}
                        </div>
                        {row.label.bottomLine && (
                          <div className="text-muted-foreground mt-1 text-xs">
                            {row.label.bottomLine}
                          </div>
                        )}
                      </TableCell>
                      {tableMeta.columns.map(column => (
                        <TableCell
                          key={column}
                          className="group-hover:bg-muted text-right tabular-nums"
                        >
                          {(row.countsByColumn[column] ?? 0).toLocaleString()}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted font-semibold">
                    <TableCell className="bg-muted sticky left-0 z-10 shadow-[2px_0_4px_-2px_rgba(0,0,0,0.1)]">
                      Total
                    </TableCell>
                    {tableMeta.columns.map(column => (
                      <TableCell
                        key={column}
                        className="text-right tabular-nums"
                      >
                        {(tableMeta.totals[column] || 0).toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}

          {specimenCounts && !tableMeta && (
            <p className="text-muted-foreground text-sm">
              No specimen count data returned for this district and month.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
