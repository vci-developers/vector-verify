'use client';

import { useState, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { PageSizeSelector } from '@/shared/components/page-size-selector';
import { TablePagination } from '@/shared/components/table-pagination';
import { DistrictFilter } from './district-filter';
import { ReviewTable } from './review-table';
import { ReviewDataListLoadingSkeleton } from './loading-skeleton';
import { calculateDateRange, toDateOnly } from '@/shared/core/utils/date-range';
import { useMonthlySummaryQuery } from '@/features/review/hooks/use-monthly-summary';
import { useTablePagination } from '@/shared/core/hooks/use-table-pagination';
import { useDistrictManagement } from '@/features/review/hooks/use-district-management';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import type { DateRangeOption } from '@/shared/core/utils/date-range';

export function ReviewDataListPageClient() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');

  const { createdAfter, createdBefore } = useMemo(
    () => calculateDateRange(dateRange),
    [dateRange],
  );

  const startDate = toDateOnly(createdAfter);
  const endDate = toDateOnly(createdBefore);

  // Get initial data to determine available districts
  const { data: initialData } = useMonthlySummaryQuery({
    startDate,
    endDate,
  });

  const { selectedDistrict, accessibleDistricts, handleDistrictSelected } =
    useDistrictManagement({
      availableDistricts: initialData?.availableDistricts,
    });

  // Initialize pagination with default values first
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

  const { data, isLoading, isFetching } = useMonthlySummaryQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
    startDate,
    endDate,
    district: selectedDistrict || undefined,
  });

  const summaries = data?.data?.items ?? [];
  const totalFromServer = data?.data?.total;

  // Update pagination with actual data and loading states
  useEffect(() => {
    if (totalFromServer !== undefined) {
      pagination.setTotal(totalFromServer);
    }
  }, [totalFromServer, pagination]);

  // Update isPagingDisabled with actual loading states
  const actualIsPagingDisabled = Boolean(isLoading || isFetching);

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
    window.location.href = `/review/${encodedDistrict}/${encodedMonthYear}`;
  }

  const isEmpty = !isLoading && !isFetching && summaries.length === 0;

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
          <ReviewTable
            summaries={summaries}
            onNavigateToReview={handleNavigateToReview}
            isEmpty={isEmpty}
          />

          <TablePagination
            page={page}
            totalPages={totalPages}
            pages={pages}
            isPagingDisabled={actualIsPagingDisabled}
            onNavigateToFirstPage={handleNavigateToFirstPage}
            onNavigateToLastPage={handleNavigateToLastPage}
            onNavigateToPage={handleNavigateToPage}
          />
        </CardContent>
      </Card>
    </div>
  );
}
