'use client';

import React, { useMemo } from 'react';
import { getMonthDateRange, groupColumnsBySpecies, getSiteLabel } from '@/features/review/utils/master-table-view';
import { useSpecimenCountsQuery } from '@/features/review/hooks/use-specimen-counts';
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { MasterTableViewLoadingSkeleton } from './loading-skeleton';

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

    const groupedColumns = groupColumnsBySpecies(columns);

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

      return {
        key: site.siteId?.toString() || `site-${index}`,
        label: getSiteLabel(site),
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

    return {
      columns,
      groupedColumns,
      rows,
      totals,
      grandTotal,
      minWidth: Math.max(640, 220 + columns.length * 140),
    };
  }, [specimenCounts?.data, specimenCounts?.columns]);

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
        {tableMeta && (
          <div className="text-muted-foreground text-sm">
            <span className="text-2xl font-semibold">
              {tableMeta.rows.length.toLocaleString()}
            </span>{' '}
            site{tableMeta.rows.length === 1 ? '' : 's'} in view
          </div>
        )}
      </header>

      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-foreground text-2xl font-semibold">
            Specimen Counts
          </h2>
          <p className="text-muted-foreground text-sm">
            Review site-level submissions for the selected district and month.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {!isLoading && !specimenCounts && (
            <p className="text-muted-foreground text-sm">
              No specimen count data available for this selection.
            </p>
          )}

          {tableMeta && (
            <div className="border-border/60 bg-background max-h-[560px] w-full overflow-auto rounded-xl border shadow-sm">
              <Table
                className="text-sm"
                style={{ minWidth: tableMeta.minWidth }}
              >
                <TableHeader>
                  <TableRow className="bg-muted">
                    <TableHead
                      className="bg-muted border-border sticky top-0 left-0 z-30 max-w-[12rem] border-r px-3 text-xs uppercase"
                      rowSpan={2}
                    >
                      Site
                    </TableHead>
                    {tableMeta.groupedColumns.groups.map((group, index) => {
                      const isNonMosquito =
                        group.columns.length === 1 &&
                        group.columns[0].displayName === group.species;

                      return (
                        <TableHead
                          key={group.species}
                          className={`bg-muted sticky top-0 z-20 text-center text-xs uppercase ${
                            index > 0 ? 'border-l-border border-l-2' : ''
                          } ${!isNonMosquito ? 'border-b' : ''}`}
                          colSpan={isNonMosquito ? 1 : group.columns.length}
                          rowSpan={isNonMosquito ? 2 : 1}
                        >
                          {group.species}
                        </TableHead>
                      );
                    })}
                    <TableHead
                      className="bg-muted border-l-border sticky top-0 z-20 border-b border-l-2 text-center text-xs uppercase"
                      rowSpan={2}
                    >
                      Total
                    </TableHead>
                  </TableRow>
                  <TableRow className="bg-muted">
                    {tableMeta.groupedColumns.groups.flatMap(
                      (group, groupIndex) => {
                        const isNonMosquito =
                          group.columns.length === 1 &&
                          group.columns[0].displayName === group.species;

                        // Skip non-mosquito columns in second row since they span 2 rows
                        if (isNonMosquito) return [];

                        return group.columns.map((column, columnIndex) => (
                          <TableHead
                            key={column.originalName}
                            className={`bg-muted sticky top-[2.5rem] z-20 text-center text-xs uppercase ${
                              groupIndex > 0 && columnIndex === 0
                                ? 'border-l-border border-l-2'
                                : ''
                            }`}
                          >
                            {column.displayName}
                          </TableHead>
                        ));
                      },
                    )}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tableMeta.rows.map((row, rowIndex) => {
                    return (
                      <TableRow
                        key={row.key}
                        className="group bg-background hover:bg-muted transition-colors"
                      >
                        <TableCell className="bg-background border-border group-hover:bg-muted sticky left-0 z-40 max-w-[12rem] border-r align-top break-words whitespace-normal shadow-[2px_0_4px_-2px_rgba(0,0,0,0.2)] transition-colors">
                          <div className="text-foreground text-sm font-semibold break-words">
                            {row.label.topLine}
                          </div>
                          {row.label.bottomLine && (
                            <div className="text-muted-foreground mt-1 text-xs break-words">
                              {row.label.bottomLine}
                            </div>
                          )}
                        </TableCell>
                        {tableMeta.groupedColumns.groups.flatMap(
                          (group, groupIndex) =>
                            group.columns.map((column, columnIndex) => (
                              <TableCell
                                key={`${row.key}-${column.originalName}`}
                                className={`bg-background text-center tabular-nums transition-colors ${
                                  groupIndex > 0 && columnIndex === 0
                                    ? 'border-l-border border-l-2'
                                    : ''
                                } group-hover:bg-muted`}
                              >
                                {(
                                  row.countsByColumn[column.originalName] ?? 0
                                ).toLocaleString()}
                              </TableCell>
                            )),
                        )}
                        <TableCell className="bg-background border-l-border group-hover:bg-muted border-l-2 text-center font-semibold tabular-nums transition-colors">
                          {(row.totalSpecimens ?? 0).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
                <TableFooter>
                  <TableRow className="bg-muted font-semibold">
                    <TableCell className="bg-muted border-border sticky left-0 z-20 max-w-[12rem] border-r shadow-[2px_0_4px_-2px_rgba(0,0,0,0.2)]">
                      Total
                    </TableCell>
                    {tableMeta.groupedColumns.groups.flatMap(
                      (group, groupIndex) =>
                        group.columns.map((column, columnIndex) => (
                          <TableCell
                            key={`total-${column.originalName}`}
                            className={`text-center tabular-nums ${
                              groupIndex > 0 && columnIndex === 0
                                ? 'border-l-border border-l-2'
                                : ''
                            }`}
                          >
                            {(
                              tableMeta.totals[column.originalName] ?? 0
                            ).toLocaleString()}
                          </TableCell>
                        )),
                    )}
                    <TableCell className="border-l-border border-l-2 text-center font-bold tabular-nums">
                      {(tableMeta.grandTotal ?? 0).toLocaleString()}
                    </TableCell>
                  </TableRow>
                </TableFooter>
              </Table>
            </div>
          )}

          {!tableMeta && !isLoading && specimenCounts && (
            <p className="text-muted-foreground text-sm">
              No specimen count data returned for this district and month.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
