import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import type {
  SpecimenCountsSummary,
  MosquitoTableMeta,
} from '@/features/review/types';
import { groupColumnsBySpecies } from '@/features/review/utils/master-table-view';

interface MosquitoCountsTableProps {
  tableMeta: MosquitoTableMeta | null;
  specimenCounts: SpecimenCountsSummary | undefined;
  isLoading: boolean;
}

export function MosquitoCountsTable({
  tableMeta,
  specimenCounts,
  isLoading,
}: MosquitoCountsTableProps) {
  if (!tableMeta && !isLoading && specimenCounts) {
    return (
      <p className="text-muted-foreground text-sm">
        No specimen count data returned for this district and month.
      </p>
    );
  }

  if (!tableMeta) {
    return null;
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="max-h-[600px] overflow-auto">
        <Table style={{ minWidth: tableMeta.minWidth }}>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted border-b">
              <TableHead
                className="bg-muted sticky top-0 left-0 z-30 min-w-[220px] border-r px-4 text-xs font-semibold uppercase"
                rowSpan={2}
              >
                Site
              </TableHead>
              {tableMeta.groupedColumns.speciesOrder.map((species, index) => {
                const speciesColumns =
                  tableMeta.groupedColumns.columnsBySpecies[species] ?? [];
                const isNonMosquito =
                  speciesColumns.length === 1 &&
                  speciesColumns[0].displayName === species;

                return (
                  <TableHead
                    key={species}
                    className={`bg-muted sticky top-0 z-20 text-center text-xs font-semibold uppercase ${
                      index > 0 ? 'border-border border-l-2' : ''
                    } ${!isNonMosquito ? 'border-border border-b' : ''}`}
                    colSpan={isNonMosquito ? 1 : speciesColumns.length}
                    rowSpan={isNonMosquito ? 2 : 1}
                  >
                    {species}
                  </TableHead>
                );
              })}
              <TableHead
                className="border-border bg-muted sticky top-0 z-20 border-b border-l-2 text-center text-xs font-semibold uppercase"
                rowSpan={2}
              >
                Total
              </TableHead>
            </TableRow>
            <TableRow className="bg-muted hover:bg-muted border-b">
              {tableMeta.groupedColumns.speciesOrder.flatMap(
                (species, groupIndex) => {
                  const speciesColumns =
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? [];
                  const isNonMosquito =
                    speciesColumns.length === 1 &&
                    speciesColumns[0].displayName === species;

                  if (isNonMosquito) return [];

                  return speciesColumns.map((column, columnIndex) => (
                    <TableHead
                      key={`${species}-${column.originalName}`}
                      className={`bg-muted sticky top-[2.5rem] z-20 text-center text-xs font-semibold uppercase ${
                        groupIndex > 0 && columnIndex === 0
                          ? 'border-border border-l-2'
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
            {tableMeta.rows.map(row => (
              <TableRow
                key={row.key}
                className="hover:bg-muted/30 border-b transition-colors last:border-b-0"
              >
                <TableCell className="bg-background sticky left-0 z-20 min-w-[220px] border-r px-4 py-4 align-top font-medium">
                  <div className="text-foreground text-sm font-semibold break-words">
                    {row.label.topLine}
                  </div>
                  {row.label.bottomLine && (
                    <div className="text-muted-foreground mt-1 text-xs break-words">
                      {row.label.bottomLine}
                    </div>
                  )}
                </TableCell>
                {tableMeta.groupedColumns.speciesOrder.flatMap(
                  (species, groupIndex) =>
                    (
                      tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                    ).map((column, columnIndex) => (
                      <TableCell
                        key={`${row.key}-${column.originalName}`}
                        className={`bg-background px-4 py-4 text-center tabular-nums transition-colors ${
                          groupIndex > 0 && columnIndex === 0
                            ? 'border-border border-l-2'
                            : ''
                        }`}
                      >
                        {(
                          row.countsByColumn[column.originalName] ?? 0
                        ).toLocaleString()}
                      </TableCell>
                    )),
                )}
                <TableCell className="bg-background border-border border-l-2 px-4 py-4 text-center font-semibold tabular-nums transition-colors">
                  {(row.totalSpecimens ?? 0).toLocaleString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
          <TableFooter>
            <TableRow className="bg-muted hover:bg-muted/50 border-t-2 font-semibold">
              <TableCell className="bg-muted sticky left-0 z-20 min-w-[220px] border-r px-4 py-4">
                Total
              </TableCell>
              {tableMeta.groupedColumns.speciesOrder.flatMap(
                (species, groupIndex) =>
                  (
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                  ).map((column, columnIndex) => (
                    <TableCell
                      key={`total-${column.originalName}`}
                      className={`bg-muted px-4 py-4 text-center tabular-nums ${
                        groupIndex > 0 && columnIndex === 0
                          ? 'border-border border-l-2'
                          : ''
                      }`}
                    >
                      {(
                        tableMeta.totals[column.originalName] ?? 0
                      ).toLocaleString()}
                    </TableCell>
                  )),
              )}
              <TableCell className="bg-muted border-border border-l-2 px-4 py-4 text-center font-bold tabular-nums">
                {(tableMeta.grandTotal ?? 0).toLocaleString()}
              </TableCell>
            </TableRow>
          </TableFooter>
        </Table>
      </div>
    </div>
  );
}
