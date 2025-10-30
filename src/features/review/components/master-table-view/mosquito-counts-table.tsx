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
  MosquitoColumn,
  MosquitoRowData,
} from '@/features/review/types';

interface MosquitoCountsTableProps {
  tableMeta: MosquitoTableMeta | null;
  specimenCounts: SpecimenCountsSummary | undefined;
}

export function MosquitoCountsTable({
  tableMeta,
  specimenCounts,
}: MosquitoCountsTableProps) {
  if (!tableMeta && specimenCounts) {
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
    <div className="border-border bg-background overflow-hidden rounded-lg border shadow-sm">
      <div className="max-h-[600px] overflow-auto">
        <Table style={{ minWidth: tableMeta.minWidth }}>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted h-12 border-b-2">
              <TableHead
                className="bg-muted sticky top-0 left-0 z-30 h-12 w-[280px] max-w-[280px] min-w-[280px] border-r-2 px-4 text-center text-xs font-semibold uppercase"
                rowSpan={2}
              >
                Site
              </TableHead>
              {tableMeta.groupedColumns.speciesOrder.map(
                (species: string, index: number) => {
                  const speciesColumns =
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? [];
                  const isNonMosquito =
                    speciesColumns.length === 1 &&
                    speciesColumns[0].displayName === species;

                  return (
                    <TableHead
                      key={species}
                      className={`bg-muted sticky top-0 z-20 h-12 text-center text-xs font-semibold uppercase ${
                        index > 0 ? 'border-border border-l-2' : ''
                      } ${!isNonMosquito ? 'border-border border-b' : ''}`}
                      colSpan={isNonMosquito ? 1 : speciesColumns.length}
                      rowSpan={isNonMosquito ? 2 : 1}
                    >
                      {species}
                    </TableHead>
                  );
                },
              )}
              {tableMeta.groupedColumns.speciesOrder.map((species, index) => {
                const speciesColumns =
                  tableMeta.groupedColumns.columnsBySpecies[species] ?? [];
                const isNonMosquito =
                  speciesColumns.length === 1 &&
                  speciesColumns[0].displayName === species;

                return (
                  <TableHead
                    key={species}
                    className={`bg-muted sticky top-0 z-20 h-12 text-center text-xs font-semibold uppercase ${
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
                className="border-border bg-muted sticky top-0 z-20 h-12 border-b border-l-2 text-center text-xs font-semibold uppercase"
                rowSpan={2}
              >
                Total
              </TableHead>
            </TableRow>
            <TableRow className="bg-muted hover:bg-muted h-12 border-b-2">
              {tableMeta.groupedColumns.speciesOrder.flatMap(
                (species: string, groupIndex: number) => {
                (species, groupIndex) => {
                  const speciesColumns =
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? [];
                  const isNonMosquito =
                    speciesColumns.length === 1 &&
                    speciesColumns[0].displayName === species;

                  if (isNonMosquito) return [];

                  return speciesColumns.map(
                    (column: MosquitoColumn, columnIndex: number) => (
                      <TableHead
                        key={`${species}-${column.originalName}`}
                        className={`bg-muted sticky top-[2.5rem] z-20 h-12 text-center text-xs font-semibold uppercase ${
                          groupIndex > 0 && columnIndex === 0
                            ? 'border-border border-l-2'
                            : ''
                        }`}
                      >
                        {column.displayName}
                      </TableHead>
                    ),
                  );
                  return speciesColumns.map((column, columnIndex) => (
                    <TableHead
                      key={`${species}-${column.originalName}`}
                      className={`bg-muted sticky top-[2.5rem] z-20 h-12 text-center text-xs font-semibold uppercase ${
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
            {tableMeta.rows.map((row: MosquitoRowData) => (
            {tableMeta.rows.map(row => (
              <TableRow
                key={row.key}
                className="hover:bg-muted/30 border-b transition-colors last:border-b-0"
              >
                <TableCell className="bg-background sticky left-0 z-20 w-[280px] max-w-[280px] min-w-[280px] border-r-2 px-4 py-4 text-center font-medium">
                  <div className="text-foreground text-sm font-semibold break-words whitespace-normal">
                    {row.label.topLine}
                  </div>
                  {row.label.bottomLine && (
                    <div className="text-muted-foreground mt-1 text-xs break-words whitespace-normal">
                      {row.label.bottomLine}
                    </div>
                  )}
                </TableCell>
                {tableMeta.groupedColumns.speciesOrder.flatMap(
                  (species: string, groupIndex: number) =>
                    (
                      tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                    ).map((column: MosquitoColumn, columnIndex: number) => (
                  (species, groupIndex) =>
                    (
                      tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                    ).map((column, columnIndex) => (
                      <TableCell
                        key={`${row.key}-${column.originalName}`}
                        className={`bg-background border-r px-4 py-4 text-center tabular-nums transition-colors ${
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
              <TableCell className="bg-muted sticky left-0 z-20 w-[280px] max-w-[280px] min-w-[280px] border-r-2 px-4 py-4 text-center">
                Total
              </TableCell>
              {tableMeta.groupedColumns.speciesOrder.flatMap(
                (species: string, groupIndex: number) =>
                  (
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                  ).map((column: MosquitoColumn, columnIndex: number) => (
                (species, groupIndex) =>
                  (
                    tableMeta.groupedColumns.columnsBySpecies[species] ?? []
                  ).map((column, columnIndex) => (
                    <TableCell
                      key={`total-${column.originalName}`}
                      className={`bg-muted border-r px-4 py-4 text-center tabular-nums ${
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
