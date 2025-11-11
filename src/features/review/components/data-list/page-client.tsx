'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ColumnDef } from '@tanstack/react-table';
import { ArrowRight, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { Button } from '@/ui/button';
import { DataTable } from '@/ui/data-table';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { PageSizeSelector } from '@/shared/components/page-size-selector';
import { TablePagination } from '@/shared/components/table-pagination';
import { ReviewDataListLoadingSkeleton } from './loading-skeleton';
import { DistrictFilter } from './district-filter';
import { useMonthlySummaryQuery } from '@/features/review/hooks/use-monthly-summary';
import { useTablePagination } from '@/shared/core/hooks/use-table-pagination';
import { useDistrictManagement } from '@/features/review/hooks/use-district-management';
import { calculateDateRange, toDateOnly } from '@/shared/core/utils/date-range';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import type { DateRangeOption } from '@/shared/core/utils/date-range';
import type { MonthlySummary } from '@/features/review/types';
import { SessionsCountCell } from './sessions-count-cell';

export function ReviewDataListPageClient() {
  const router = useRouter();
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');

  const { createdAfter, createdBefore } = useMemo(
    () => calculateDateRange(dateRange),
    [dateRange],
  );

  const startDate = toDateOnly(createdAfter);
  const endDate = toDateOnly(createdBefore);

  const pagination = useTablePagination({
    isLoading: false,
    isFetching: false,
  });

  const {
    page,
    pageSize,
    totalPages,
    pages,
    handleRowsPerPageChange,
    handleNavigateToFirstPage,
    handleNavigateToLastPage,
    handleNavigateToPage,
    setPage,
  } = pagination;

  const { data: unfilteredData } = useMonthlySummaryQuery({
    startDate,
    endDate,
  });

  const availableDistricts = useMemo(() => {
    return unfilteredData?.availableDistricts ?? [];
  }, [unfilteredData?.availableDistricts]);

  const { selectedDistrict, accessibleDistricts, handleDistrictSelected } =
    useDistrictManagement({
      availableDistricts,
    });

  const { data, isLoading, isFetching } = useMonthlySummaryQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    startDate,
    endDate,
    district: selectedDistrict || undefined,
  });

  const summaries = data?.data?.items ?? [];
  const total = data?.data?.total;

  useEffect(() => {
    if (total !== undefined) {
      pagination.setTotal(total);
    }
  }, [total, pagination]);

  useEffect(() => {
    if (
      selectedDistrict &&
      accessibleDistricts.length > 0 &&
      !accessibleDistricts.includes(selectedDistrict)
    ) {
      handleDistrictSelected(null);
    }
  }, [accessibleDistricts, selectedDistrict, handleDistrictSelected]);

  function handleDateRangeChange(newDateRange: DateRangeOption) {
    setDateRange(newDateRange);
    setPage(1);
  }

  function handleDistrictChange(district: string | null) {
    handleDistrictSelected(district);
    setPage(1);
  }

  function handleNavigateToReview(district: string, monthYear: string) {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMonthYear = encodeURIComponent(monthYear);
    router.push(`/review/${encodedDistrict}/${encodedMonthYear}`);
  }

  function handleNavigateToDashboard(district: string, monthYear: string) {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMonthYear = encodeURIComponent(monthYear);
    router.push(`/review/${encodedDistrict}/${encodedMonthYear}/dashboard`);
  }

  const columns: ColumnDef<MonthlySummary>[] = useMemo(
    () => [
      {
        id: 'district',
        accessorKey: 'district',
        header: 'District / Month',
        cell: ({ row }) => {
          const summary = row.original;
          return (
            <div className="text-center">
              <div className="text-foreground font-semibold">
                {summary.district}
              </div>
              <div className="text-muted-foreground text-sm">
                {summary.monthName}
              </div>
            </div>
          );
        },
      },
      {
        id: 'sessionCount',
        accessorKey: 'sessionCount',
        header: 'Sessions',
        cell: ({ row }) => (
          <SessionsCountCell
            district={row.original.district}
            monthString={row.original.monthString}
          />
        ),
      },
      {
        id: 'actions',
        accessorKey: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const summary = row.original;
          return (
            <div className="flex justify-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleNavigateToReview(summary.district, summary.monthString)
                }
                className="text-primary hover:text-primary/80 h-auto p-0 font-normal"
              >
                Review
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleNavigateToDashboard(
                    summary.district,
                    summary.monthString,
                  )
                }
                className="h-auto p-0 font-normal text-blue-600 hover:text-blue-800"
              >
                <BarChart3 className="mr-1 h-3 w-3" />
                Dashboard
              </Button>
            </div>
          );
        },
      },
    ],
    [],
  );

  if (isLoading || isFetching) {
    return <ReviewDataListLoadingSkeleton />;
  }

  return (
    <div className="container mx-auto px-4 py-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Review Data</CardTitle>
          <div className="flex items-center gap-4">
            <DateRangeFilter
              value={dateRange}
              onValueChange={handleDateRangeChange}
              disabled={isLoading || isFetching}
            />
            <DistrictFilter
              districts={accessibleDistricts}
              selectedDistrict={selectedDistrict}
              onDistrictSelected={handleDistrictChange}
              disabled={
                isLoading || isFetching || accessibleDistricts.length === 0
              }
            />
            <PageSizeSelector
              value={pageSize}
              onValueChange={handleRowsPerPageChange}
              options={PAGE_SIZES}
              disabled={isLoading || isFetching}
            />
          </div>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={summaries}
            searchKey="district"
            searchPlaceholder="Search districts..."
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            pages={pages}
            isPagingDisabled={isLoading || isFetching}
            onNavigateToFirstPage={handleNavigateToFirstPage}
            onNavigateToLastPage={handleNavigateToLastPage}
            onNavigateToPage={handleNavigateToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
