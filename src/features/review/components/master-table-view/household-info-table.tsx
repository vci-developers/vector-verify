import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/ui/table';
import { MasterTableViewLoadingSkeleton } from './loading-skeleton';
import type {
  HouseholdRowData,
  HouseholdTableMeta,
} from '@/features/review/types';

interface HouseholdInfoTableProps {
  tableMeta: HouseholdTableMeta | null;
  isLoading: boolean;
}

const tableColumns = [
  {
    key: 'collectorName',
    label: 'Collector Name',
    width: 'min-w-[220px]',
    render: (row: HouseholdRowData) => {
      if (row.hasCollectorNameDiscrepancy) {
        return (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950/30">
              <svg
                className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                Multiple values
              </span>
            </div>
            <div className="space-y-1 pl-1">
              {row.collectorNames.map((name, idx) => (
                <div
                  key={idx}
                  className="text-foreground flex items-start gap-1.5 text-sm"
                >
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{name}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <span className="text-foreground text-sm">
          {row.collectorName ?? '—'}
        </span>
      );
    },
  },
  {
    key: 'collectorTitle',
    label: 'Collector Title',
    width: 'min-w-[200px]',
    render: (row: HouseholdRowData) => {
      if (row.hasCollectorTitleDiscrepancy) {
        return (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950/30">
              <svg
                className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                Multiple values
              </span>
            </div>
            <div className="space-y-1 pl-1">
              {row.collectorTitles.map((title, idx) => (
                <div
                  key={idx}
                  className="text-foreground flex items-start gap-1.5 text-sm"
                >
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{title}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <span className="text-foreground text-sm">
          {row.collectorTitle ?? '—'}
        </span>
      );
    },
  },
  {
    key: 'collectionDate',
    label: 'Collection Date',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) => (
      <span className="text-foreground text-sm">
        {formatDate(row.mostRecentDate)}
      </span>
    ),
  },
  {
    key: 'collectionMethod',
    label: 'Method',
    width: 'min-w-[200px]',
    render: (row: HouseholdRowData) => {
      if (row.hasCollectionMethodDiscrepancy) {
        return (
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950/30">
              <svg
                className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500"
                fill="currentColor"
                viewBox="0 0 16 16"
              >
                <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z" />
              </svg>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
                Multiple values
              </span>
            </div>
            <div className="space-y-1 pl-1">
              {row.collectionMethods.map((method, idx) => (
                <div
                  key={idx}
                  className="text-foreground flex items-start gap-1.5 text-sm"
                >
                  <span className="text-muted-foreground mt-0.5">•</span>
                  <span>{method}</span>
                </div>
              ))}
            </div>
          </div>
        );
      }
      return (
        <span className="text-foreground text-sm">
          {row.collectionMethod ?? '—'}
        </span>
      );
    },
  },
] as const;

export function HouseholdInfoTable({
  tableMeta,
  isLoading,
}: HouseholdInfoTableProps) {
  if (isLoading) {
    return <MasterTableViewLoadingSkeleton />;
  }

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
                {tableColumns.map(column => (
                  <TableCell
                    key={`${row.key}-${column.key}`}
                    className={`bg-background px-4 py-4 align-top ${column.width}`}
                  >
                    {column.render(row)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

function formatDate(value?: number | null) {
  if (!value) return '—';
  return new Date(value).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}
