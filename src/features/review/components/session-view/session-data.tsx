'use client';

import React, { useMemo } from 'react';
import { useSpecimenCountsQuery } from '@/features/review/hooks/use-specimen-counts';
import { useSessionQuery } from '../../hooks';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { TableSkeleton } from './loading-skeleton';
import type { Session } from '@/shared/entities/session/model';

interface SessionDataProps {
  session: Session;
  district: string;
  monthYear: string;
}

export function SessionData({
  session,
  district,
  monthYear,
}: SessionDataProps) {
  const { data: specimenCounts, isLoading } = useSpecimenCountsQuery({
    district,
    sessionId: String(session.sessionId),
    monthYear,
  });

  const { data: sessionData } = useSessionQuery(String(session.sessionId));
  const siteData = sessionData?.site;
  const address = [
    siteData?.subCounty,
    siteData?.parish,
    siteData?.villageName,
    siteData?.houseNumber,
  ]
    .filter(Boolean)
    .join(' • ') || 'No location data';

  const tableData = useMemo(() => {
    if (!specimenCounts?.data || !specimenCounts?.columns) {
      return { columns: [], rowLabels: [], data: {} };
    }

    const speciesSet = new Set<string>();
    const rowLabelsSet = new Set<string>();
    const dataMap: Record<string, Record<string, number>> = {};

    specimenCounts.data.forEach(site => {
      site.counts.forEach(count => {
        if (count.species) {
          speciesSet.add(count.species);
        }

        let rowLabel = '';

        if (count.sex === 'Male') {
          rowLabel = 'Male';
        } else if (count.sex === 'Female') {
          if (count.abdomenStatus) {
            rowLabel = `Female ${count.abdomenStatus}`;
          } else {
            rowLabel = 'Female';
          }
        } else if (count.sex) {
          rowLabel = count.sex;
        } else {
          return;
        }

        rowLabelsSet.add(rowLabel);

        const columnKey = count.species || 'Unknown';

        if (!dataMap[rowLabel]) {
          dataMap[rowLabel] = {};
        }
        if (!dataMap[rowLabel][columnKey]) {
          dataMap[rowLabel][columnKey] = 0;
        }
        dataMap[rowLabel][columnKey] += count.count || 0;
      });
    });

    const columns = Array.from(speciesSet).sort();

    const rowLabels = Array.from(rowLabelsSet).sort((a, b) => {
      if (a === 'Male') return -1;
      if (b === 'Male') return 1;
      if (a.startsWith('Female') && !b.startsWith('Female')) return -1;
      if (b.startsWith('Female') && !a.startsWith('Female')) return 1;
      return a.localeCompare(b);
    });

    return { columns, rowLabels, data: dataMap };
  }, [specimenCounts]);

  const renderTable = () => {
    if (isLoading) {
      return (
        <div className="flex w-full justify-center py-8">
          <TableSkeleton />
        </div>
      );
    }

    if (!tableData.columns.length || !tableData.rowLabels.length) {
      return (
        <div className="border-border/60 bg-background text-muted-foreground w-full overflow-auto rounded-xl border p-8 text-center shadow-sm">
          No specimen data available for this session.
        </div>
      );
    }

    return (
      <div className="border-border/60 bg-background w-full overflow-auto rounded-xl border shadow-sm">
        <Table className="min-w-[640px] text-sm">
          <TableHeader>
            <TableRow className="bg-muted">
              <TableHead className="bg-muted border-border sticky left-0 z-30 max-w-40 border-r px-3 text-xs uppercase">
                Sex/Abdomen Status
              </TableHead>
              {tableData.columns.map(column => (
                <TableHead
                  key={column}
                  className="bg-muted text-center text-xs uppercase"
                >
                  {column}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {tableData.rowLabels.map(rowLabel => {
              const rowData = tableData.data[rowLabel];
              return (
                <TableRow key={rowLabel}>
                  <TableCell className="bg-background border-border sticky left-0 z-20 max-w-40 border-r align-top font-semibold">
                    {rowLabel}
                  </TableCell>
                  {tableData.columns.map(column => (
                    <TableCell
                      key={column}
                      className="bg-background text-center tabular-nums"
                    >
                      {rowData[column] ? rowData[column].toLocaleString() : '0'}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
            <TableRow>
              <TableCell className="bg-background border-border sticky left-0 z-20 max-w-40 border-r align-top font-semibold">
                Total
              </TableCell>
              {tableData.columns.map(column => {
                const columnTotal =
                  specimenCounts?.data.reduce((sum, site) => {
                    return (
                      sum +
                      site.counts
                        .filter(count => (count.species || 'Unknown') === column)
                        .reduce(
                          (countSum, count) => countSum + (count.count || 0),
                          0,
                        )
                    );
                  }, 0) || 0;
                return (
                  <TableCell
                    key={column}
                    className="bg-background text-center font-semibold tabular-nums"
                  >
                    {columnTotal ? columnTotal.toLocaleString() : '0'}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableBody>
        </Table>
      </div>
    );
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <p className="text-muted-foreground mb-2 text-sm">
            {address}
          </p>
          <p className="text-muted-foreground mb-4 text-sm">
            <span className="font-semibold">Specimen Condition:</span>{' '}
            {session.specimenCondition || 'No specimen condition recorded.'}
          </p>
          {renderTable()}
          <div className="mt-6 border-t pt-4">
            <label className="text-foreground mb-1 block text-sm font-medium">
              Notes
            </label>
            <textarea
              className="bg-background text-foreground w-full resize-none rounded border p-2 text-sm"
              rows={3}
              value={session.notes || ''}
              readOnly
              placeholder="No notes recorded."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
