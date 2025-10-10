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
  monthYear: string; // Format "YYYY-MM"
}

function formatMonthLabel(monthYear: string) {
  const [year, month] = monthYear.split('-');
  return new Date(Number.parseInt(year, 10), Number.parseInt(month, 10) - 1, 1).toLocaleDateString(
    'en-US',
    {
      month: 'long',
      year: 'numeric',
    },
  );
}

function getSiteLabel(site: SpecimenCountsSite) {
  const info = site.siteInfo ?? {};

  const topLineParts = [
    info.villageName,
    info.houseNumber ? `House ${info.houseNumber}` : null,
  ].filter(Boolean) as string[];

  let topLine = topLineParts.join(' • ');
  if (!topLine) {
    topLine =
      info.healthCenter ??
      info.parish ??
      info.subCounty ??
      info.district ??
      `Site #${site.siteId}`;
  }

  const bottomLineParts = [
    info.healthCenter && info.healthCenter !== topLine ? info.healthCenter : null,
    info.parish && !topLineParts.includes(info.parish) ? info.parish : null,
    info.subCounty && !topLineParts.includes(info.subCounty) ? info.subCounty : null,
    info.district && !topLineParts.includes(info.district) ? info.district : null,
  ].filter(Boolean) as string[];

  const bottomLine = bottomLineParts.length > 0 ? bottomLineParts.join(' • ') : null;

  return {
    topLine,
    bottomLine,
  };
}

export function MasterTableViewPageClient({
  district,
  monthYear,
}: MasterTableViewPageClientProps) {
  const formattedMonthYear = decodeURIComponent(monthYear);
  const formattedDistrict = decodeURIComponent(district);

  const dateRange = getMonthDateRange(formattedMonthYear);
  const startDate = dateRange?.startDate ?? null;
  const endDate = dateRange?.endDate ?? null;

  const {
    data: specimenCounts,
    isLoading,
    isError,
    error,
  } = useSpecimenCountsQuery({
    district: formattedDistrict,
    monthYear: formattedMonthYear,
  });

  const monthLabel = useMemo(
    () => formatMonthLabel(formattedMonthYear),
    [formattedMonthYear],
  );

  const tableMeta = useMemo(() => {
    if (!specimenCounts) {
      return null;
    }

    const rows = specimenCounts.data ?? [];
    let columns = (specimenCounts.columns ?? []).filter(
      (column): column is string => Boolean(column),
    );

    if (columns.length === 0) {
      const derivedColumns = new Set<string>();
      rows.forEach(site => {
        site.counts.forEach(count => {
          if (count.columnName) {
            derivedColumns.add(count.columnName);
          }
        });
      });
      columns = Array.from(derivedColumns);
    }

    if (columns.length === 0 || rows.length === 0) {
      return null;
    }

    const mappedRows = rows.map((site, index) => {
      const label = getSiteLabel(site);
      const countsByColumn = site.counts.reduce<Record<string, number>>((acc, count) => {
        if (!count.columnName) return acc;
        const value = typeof count.count === 'number' ? count.count : 0;
        acc[count.columnName] = (acc[count.columnName] ?? 0) + value;
        return acc;
      }, {});

      const key = site.siteId ?? `site-${index}`;
      return { key, label, countsByColumn };
    });

    const totals = mappedRows.reduce<Record<string, number>>((acc, row) => {
      columns.forEach(column => {
        acc[column] = (acc[column] ?? 0) + (row.countsByColumn[column] ?? 0);
      });
      return acc;
    }, {});

    const minWidth = Math.max(640, 220 + columns.length * 140);

    return { columns, rows: mappedRows, totals, minWidth };
  }, [specimenCounts]);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-border/70 pb-4">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide">DHIS2 Review</p>
          <h1 className="text-foreground text-3xl font-semibold">{formattedDistrict}</h1>
          <p className="text-muted-foreground text-sm">
            {monthLabel}
            {(startDate || endDate) && (
              <span>{` • ${startDate ?? '—'} – ${endDate ?? '—'}`}</span>
            )}
          </p>
        </div>
        {tableMeta && (
          <div className="text-muted-foreground text-sm">
            <span className="text-foreground text-2xl font-semibold">
              {tableMeta.rows.length.toLocaleString()}
            </span>{' '}
            site{tableMeta.rows.length === 1 ? '' : 's'} in view
          </div>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-foreground text-2xl font-semibold">Specimen Counts</h2>
            <p className="text-muted-foreground text-sm">
              Review site-level submissions for the selected district and month.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          {isLoading && (
            <p className="text-muted-foreground text-sm">Loading specimen counts…</p>
          )}

          {isError && (
            <p className="text-destructive text-sm">
              Failed to load specimen counts: {error?.message ?? 'Unknown error'}
            </p>
          )}

          {!isLoading && !isError && specimenCounts == null && (
            <p className="text-muted-foreground text-sm">
              No specimen count data available for this selection.
            </p>
          )}

          {tableMeta && (
            <div className="max-h-[560px] w-full overflow-auto rounded-xl border border-border/60 bg-background shadow-sm">
              <Table className="text-sm" style={{ minWidth: tableMeta.minWidth }}>
                <TableHeader>
                  <TableRow className="bg-muted/60">
                    <TableHead className="sticky left-0 top-0 z-30 min-w-[240px] bg-muted text-xs uppercase tracking-wide">
                      Site
                    </TableHead>
                    {tableMeta.columns.map(column => (
                      <TableHead
                        key={column}
                        className="sticky top-0 z-20 bg-muted text-right text-xs uppercase tracking-wide"
                      >
                        {column}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableMeta.rows.map((row, rowIndex) => {
                    const baseBg = rowIndex % 2 === 0 ? 'bg-background' : 'bg-muted';
                    const cellBg = baseBg;
                    return (
                      <TableRow
                        key={row.key}
                        className={`group ${baseBg} hover:bg-muted transition-colors`}
                      >
                        <TableCell
                          className={`sticky left-0 z-40 ${baseBg} align-top shadow-[2px_0_4px_-2px_rgba(0,0,0,0.25)] transition-colors group-hover:bg-muted`}
                        >
                          <div className="font-semibold text-sm text-foreground">{row.label.topLine}</div>
                          {row.label.bottomLine && (
                            <div className="text-muted-foreground mt-1 text-xs">{row.label.bottomLine}</div>
                          )}
                        </TableCell>
                        {tableMeta.columns.map(column => (
                          <TableCell
                            key={`${row.key}-${column}`}
                            className={`text-right tabular-nums ${cellBg} transition-colors group-hover:bg-muted`}
                          >
                            {(row.countsByColumn[column] ?? 0).toLocaleString()}
                          </TableCell>
                        ))}
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted font-semibold">
                    <TableCell className="sticky left-0 z-20 bg-muted shadow-[2px_0_4px_-2px_rgba(0,0,0,0.2)]">
                      Total
                    </TableCell>
                    {tableMeta.columns.map(column => (
                      <TableCell key={`total-${column}`} className="text-right tabular-nums">
                        {(tableMeta.totals[column] ?? 0).toLocaleString()}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}

          {!tableMeta && !isLoading && !isError && specimenCounts && (
            <p className="text-muted-foreground text-sm">
              No specimen count data returned for this district and month.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
