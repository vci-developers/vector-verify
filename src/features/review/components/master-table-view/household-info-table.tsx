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
    width: 'min-w-[180px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectorNameDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={row.collectorName} />
      ),
  },
  {
    key: 'collectorTitle',
    label: 'Collector Title',
    width: 'min-w-[180px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectorTitleDiscrepancy ? (
        <DiscrepancyCell />
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
    label: 'Collection Method',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) =>
      row.hasCollectionMethodDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={row.collectionMethod} />
      ),
  },
  {
    key: 'numPeopleSleptInHouse',
    label: 'People in House',
    width: 'min-w-[140px]',
    render: (row: HouseholdRowData) => {
      const values = row.numPeopleSleptInHouse.filter(
        (v): v is number => v !== null,
      );
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasNumPeopleSleptInHouseDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={String(values[0])} />
      );
    },
  },
  {
    key: 'wasIrsConducted',
    label: 'IRS Conducted',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) => {
      const values = row.wasIrsConducted.filter(
        (v): v is boolean => v !== null,
      );
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasWasIrsConductedDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={values[0] ? 'Yes' : 'No'} />
      );
    },
  },
  {
    key: 'monthsSinceIrs',
    label: 'Months Since IRS',
    width: 'min-w-[150px]',
    render: (row: HouseholdRowData) => {
      const values = row.monthsSinceIrs.filter((v): v is number => v !== null);
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasMonthsSinceIrsDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={String(values[0])} />
      );
    },
  },
  {
    key: 'numLlinsAvailable',
    label: 'LLINs Available',
    width: 'min-w-[140px]',
    render: (row: HouseholdRowData) => {
      const values = row.numLlinsAvailable.filter(
        (v): v is number => v !== null,
      );
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasNumLlinsAvailableDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={String(values[0])} />
      );
    },
  },
  {
    key: 'llinType',
    label: 'LLIN Type',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) => {
      const values = row.llinType.filter((v): v is string => v !== null);
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasLlinTypeDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={values[0]} />
      );
    },
  },
  {
    key: 'llinBrand',
    label: 'LLIN Brand',
    width: 'min-w-[130px]',
    render: (row: HouseholdRowData) => {
      const values = row.llinBrand.filter((v): v is string => v !== null);
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasLlinBrandDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={values[0]} />
      );
    },
  },
  {
    key: 'numPeopleSleptUnderLlin',
    label: 'People Slept Under LLIN',
    width: 'min-w-[160px]',
    render: (row: HouseholdRowData) => {
      const values = row.numPeopleSleptUnderLlin.filter(
        (v): v is number => v !== null,
      );
      if (values.length === 0) return <StandardCell value={null} />;
      return row.hasNumPeopleSleptUnderLlinDiscrepancy ? (
        <DiscrepancyCell />
      ) : (
        <StandardCell value={String(values[0])} />
      );
    },
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
                  <div className="text-foreground text-sm font-semibold break-words whitespace-normal">
                    {row.siteLabel.topLine}
                  </div>
                  {row.siteLabel.bottomLine && (
                    <div className="text-muted-foreground mt-1 text-xs break-words whitespace-normal">
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
