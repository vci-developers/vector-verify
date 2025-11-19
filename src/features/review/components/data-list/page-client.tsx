'use client';

import { useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { DataTable } from '@/ui/data-table';
import { PageSizeSelector } from '@/shared/components/page-size-selector';
import { TablePagination } from '@/shared/components/table-pagination';
import { ReviewDataListLoadingSkeleton } from './loading-skeleton';
import { DistrictFilter } from './district-filter';
import { createMonthlySummaryColumns } from './columns';
import { useMonthlySummaryQuery } from '@/features/review/hooks/use-monthly-summary';
import { useTablePagination } from '@/shared/core/hooks/use-table-pagination';
import { useDistrictManagement } from '@/features/review/hooks/use-district-management';
import {
  buildReviewPath,
  buildDashboardPath,
} from '@/features/review/utils/navigation';
import { PAGE_SIZES } from '@/shared/entities/pagination';

export function ReviewDataListPageClient() {
  const router = useRouter();

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

  const { data: unfilteredData } = useMonthlySummaryQuery({});

  const availableDistricts = useMemo(
    () => unfilteredData?.availableDistricts ?? [],
    [unfilteredData?.availableDistricts],
  );

  const { selectedDistrict, accessibleDistricts, handleDistrictSelected } =
    useDistrictManagement({
      availableDistricts,
    });

  const { data, isLoading, isFetching } = useMonthlySummaryQuery({
    offset: (page - 1) * pageSize,
    limit: pageSize,
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

  const handleDistrictChange = useCallback(
    (district: string | null) => {
      handleDistrictSelected(district);
      setPage(1);
    },
    [handleDistrictSelected, setPage],
  );

  const handleNavigateToReview = useCallback(
    (district: string, monthYear: string) => {
      router.push(buildReviewPath(district, monthYear));
    },
    [router],
  );

  const handleNavigateToDashboard = useCallback(
    (district: string, monthYear: string) => {
      router.push(buildDashboardPath(district, monthYear));
    },
    [router],
  );

  const columns = useMemo(
    () =>
      createMonthlySummaryColumns({
        onNavigateToReview: handleNavigateToReview,
        onNavigateToDashboard: handleNavigateToDashboard,
      }),
    [handleNavigateToReview, handleNavigateToDashboard],
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
