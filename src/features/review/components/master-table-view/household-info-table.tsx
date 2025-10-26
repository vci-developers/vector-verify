import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import type {
  HouseholdRowData,
  HouseholdTableMeta,
} from '@/features/review/types';
import { DiscrepancyCell } from './discrepancy-cell';
import { StandardCell } from './standard-cell';
import { NoDataCell } from './no-data-cell';

interface HouseholdInfoTableProps {
  tableMeta: HouseholdTableMeta | null;
}

function formatDate(value?: number | null) {
  if (!value) return null;
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

const tableColumns = [
  {
    key: 'collectorName',
    label: 'Collector Name',
    width: 'min-w-[220px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectorNameDiscrepancy ? (
        <DiscrepancyCell values={row.collectorNames} />
      ) : (
        <StandardCell value={row.collectorName} />
      ),
  },
  {
    key: 'collectorTitle',
    label: 'Collector Title',
    width: 'min-w-[200px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectorTitleDiscrepancy ? (
        <DiscrepancyCell values={row.collectorTitles} />
      ) : (
        <StandardCell value={row.collectorTitle} />
      ),
  },
  {
    key: 'collectionDate',
    label: 'Collection Date',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) => (
      <StandardCell value={formatDate(row.mostRecentDate)} />
    ),
  },
  {
    key: 'collectionMethod',
    label: 'Method',
    width: 'min-w-[200px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectionMethodDiscrepancy ? (
        <DiscrepancyCell values={row.collectionMethods} />
      ) : (
        <StandardCell value={row.collectionMethod} />
      ),
  },
] as const;

export function HouseholdInfoTable({ tableMeta }: HouseholdInfoTableProps) {
  if (!tableMeta) {
    return (
      <p className="text-muted-foreground text-sm">
        No household session data available for this selection.
      </p>
    );
  }

  return (
    <div className="border-border bg-background overflow-hidden rounded-lg border">
      <div className="max-h-[600px] overflow-auto">
        <Table style={{ minWidth: tableMeta.minWidth }}>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted border-b">
              <TableHead className="bg-muted sticky top-0 left-0 z-30 min-w-[220px] border-r px-4 text-xs font-semibold uppercase">
                Site
              </TableHead>
              {tableColumns.map(column => (
                <TableHead
                  key={column.key}
                  className={`bg-muted sticky top-0 z-20 text-xs font-semibold uppercase ${column.width}`}
                >
                  {column.label}
                </TableHead>
              ))}
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
                    {row.siteLabel.topLine}
                  </div>
                  {row.siteLabel.bottomLine && (
                    <div className="text-muted-foreground mt-1 text-xs break-words">
                      {row.siteLabel.bottomLine}
                    </div>
                  )}
                </TableCell>
                {row.sessionCount === 0 ? (
                  <TableCell
                    colSpan={tableColumns.length}
                    className="bg-background px-4 py-4"
                  >
                    <NoDataCell />
                  </TableCell>
                ) : (
                  tableColumns.map(column => (
                    <TableCell
                      key={`${row.key}-${column.key}`}
                      className={`bg-background px-4 py-4 align-top ${column.width}`}
                    >
                      {column.render(row)}
                    </TableCell>
                  ))
                )}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
