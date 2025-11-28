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

function renderDiscrepancyAwareCell<T>(
  input: T | null | undefined | (T | null | undefined)[],
  hasDiscrepancy: boolean,
  formatValue: (value: T) => string | null = value => String(value),
) {
  const valuesArray = Array.isArray(input) ? input : [input];
  const nonNull = valuesArray.filter(
    (value): value is T => value !== null && value !== undefined,
  );

  if (hasDiscrepancy) {
    return <DiscrepancyCell />;
  }

  if (nonNull.length === 0) {
    return <StandardCell value={null} />;
  }

  const formattedValue = formatValue(nonNull[0]);
  return <StandardCell value={formattedValue ?? null} />;
}

const tableColumns = [
  {
    key: 'collectorName',
    label: 'Collector Name',
    width: 'min-w-[180px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.collectorName,
        row.hasCollectorNameDiscrepancy,
      ),
  },
  {
    key: 'collectorTitle',
    label: 'Collector Title',
    width: 'min-w-[180px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.collectorTitle,
        row.hasCollectorTitleDiscrepancy,
      ),
  },
  {
    key: 'collectionDate',
    label: 'Collection Date',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(row.mostRecentDate, false, value =>
        formatDate(value),
      ),
  },
  {
    key: 'collectionMethod',
    label: 'Collection Method',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.collectionMethod,
        row.hasCollectionMethodDiscrepancy,
      ),
  },
  {
    key: 'numPeopleSleptInHouse',
    label: 'People in House',
    width: 'min-w-[140px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.numPeopleSleptInHouse,
        row.hasNumPeopleSleptInHouseDiscrepancy,
      ),
  },
  {
    key: 'wasIrsConducted',
    label: 'IRS Conducted',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.wasIrsConducted,
        row.hasWasIrsConductedDiscrepancy,
        value => (value ? 'Yes' : 'No'),
      ),
  },
  {
    key: 'monthsSinceIrs',
    label: 'Months Since IRS',
    width: 'min-w-[150px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.monthsSinceIrs,
        row.hasMonthsSinceIrsDiscrepancy || row.hasWasIrsConductedDiscrepancy,
      ),
  },
  {
    key: 'numLlinsAvailable',
    label: 'LLINs Available',
    width: 'min-w-[140px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.numLlinsAvailable,
        row.hasNumLlinsAvailableDiscrepancy,
      ),
  },
  {
    key: 'llinType',
    label: 'LLIN Type',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(row.llinType, row.hasLlinTypeDiscrepancy),
  },
  {
    key: 'llinBrand',
    label: 'LLIN Brand',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(row.llinBrand, row.hasLlinBrandDiscrepancy),
  },
  {
    key: 'numPeopleSleptUnderLlin',
    label: 'People Slept Under LLIN',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) =>
      renderDiscrepancyAwareCell(
        row.numPeopleSleptUnderLlin,
        row.hasNumPeopleSleptUnderLlinDiscrepancy,
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
    <div className="border-border bg-background overflow-hidden rounded-lg border shadow-sm">
      <div className="max-h-[600px] overflow-auto">
        <Table style={{ minWidth: tableMeta.minWidth }}>
          <TableHeader>
            <TableRow className="bg-muted hover:bg-muted h-24 border-b-2">
              <TableHead className="bg-muted sticky top-0 left-0 z-30 h-24 w-[280px] max-w-[280px] min-w-[280px] border-r-2 px-4 text-center text-xs font-semibold uppercase">
                Site
              </TableHead>
              {tableColumns.map(column => (
                <TableHead
                  key={column.key}
                  className={`bg-muted sticky top-0 z-20 h-24 border-r px-4 text-center text-xs font-semibold uppercase last:border-r-0 ${column.width}`}
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
                <TableCell className="bg-background sticky left-0 z-20 w-[280px] max-w-[280px] min-w-[280px] border-r-2 px-4 py-4 text-center font-medium">
                  <div className="text-foreground text-sm font-semibold wrap-break-word whitespace-normal">
                    {row.siteLabel.topLine}
                  </div>
                  {row.siteLabel.bottomLine && (
                    <div className="text-muted-foreground mt-1 text-xs wrap-break-word whitespace-normal">
                      {row.siteLabel.bottomLine}
                    </div>
                  )}
                </TableCell>
                {row.sessionCount === 0 ? (
                  <TableCell
                    colSpan={tableColumns.length}
                    className="bg-background px-4 py-4 text-center"
                  >
                    <NoDataCell />
                  </TableCell>
                ) : (
                  tableColumns.map(column => (
                    <TableCell
                      key={`${row.key}-${column.key}`}
                      className={`bg-background border-r px-4 py-4 text-center last:border-r-0 ${column.width}`}
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
