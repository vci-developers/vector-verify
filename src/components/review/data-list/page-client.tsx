'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DateRangeFilter } from '@/components/annotate/tasks-list/date-range-filter';
import { DistrictFilter } from './district-filter';
import { ReviewTable } from './review-table';
import { ReviewDataListLoadingSkeleton } from './loading-skeleton';
import { useDateRangeValues } from '@/lib/shared/utils/date-range';
import { useMonthlySummaryQuery, useAccumulatedDistricts } from '@/lib/review';
import { usePagination } from '@/lib/shared/hooks/use-pagination';
import { PAGE_SIZES } from '@/lib/shared/constants';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationLast,
} from '@/components/ui/pagination';
import type { DateRangeOption } from '@/lib/shared/utils/date-range';

export function ReviewDataListPageClient() {
  
  // Local state for filters
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const { createdAfter, createdBefore } = useDateRangeValues(dateRange);

  const pagination = usePagination({});
  const {
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSizeAndReset,
    canPrev,
    canNext,
    totalPages,
    range: pages,
    start: offset,
  } = pagination;

  // Convert ISO dates to YYYY-MM-DD format for API
  const from = createdAfter
    ? new Date(createdAfter).toISOString().split('T')[0]
    : undefined;
  const to = createdBefore
    ? new Date(createdBefore).toISOString().split('T')[0]
    : undefined;

  // Fetch monthly summary data with current filters
  const { data, isLoading, isFetching } = useMonthlySummaryQuery({
    offset,
    limit: pageSize,
    from,
    to,
    district: selectedDistrict || undefined,
  });

  const summaries = data?.data?.items ?? [];
  const totalFromServer = data?.data?.total;

  // Accumulate all unique districts from API responses
  const allDistricts = useAccumulatedDistricts(data?.availableDistricts);

  useEffect(() => {
    // Only update total when we have actual data to prevent pagination resets
    if (totalFromServer !== undefined) {
      setTotal(totalFromServer);
    }
  }, [totalFromServer, setTotal]);

  const isPagingDisabled = isLoading || isFetching;

  function handleRowsPerPageChange(value: string) {
    setPageSizeAndReset(Number(value));
  }

  function handleDateRangeChange(newDateRange: DateRangeOption) {
    setDateRange(newDateRange);
    // Reset pagination to page 1 when date range changes
    setPage(1);
  }

  function handleDistrictSelected(district: string | null) {
    setSelectedDistrict(district);
    // Reset pagination to page 1 when district changes
    setPage(1);
  }

  function handleNavigateToPreviousPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && canPrev) setPage(page - 1);
  }

  function handleNavigateToNextPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && canNext) setPage(page + 1);
  }

  function handleNavigateToFirstPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && page > 1) setPage(1);
  }

  function handleNavigateToLastPage(
    event: React.MouseEvent<HTMLAnchorElement>,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && page < totalPages) setPage(totalPages);
  }

  function handleNavigateToPage(
    event: React.MouseEvent<HTMLAnchorElement>,
    pageNumber: number,
  ) {
    event.preventDefault();
    if (!isPagingDisabled && pageNumber !== page) setPage(pageNumber);
  }

  function handleNavigateToReview(district: string, month: string) {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMonth = encodeURIComponent(month);
    window.location.href = `/review/${encodedDistrict}/${encodedMonth}`;
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
              districts={allDistricts.map(d => ({
                value: d,
                label: d,
              }))}
              selectedDistrict={selectedDistrict}
              onDistrictSelected={handleDistrictSelected}
              disabled={isLoading || isFetching}
            />
            <Select
              value={String(pageSize)}
              onValueChange={handleRowsPerPageChange}
            >
              <SelectTrigger size="sm">
                <SelectValue placeholder="Page size" />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZES.map(size => (
                  <SelectItem key={size} value={String(size)}>
                    {size} / page
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <ReviewTable
            summaries={summaries}
            onNavigateToReview={handleNavigateToReview}
            isEmpty={isEmpty}
          />

          <div className="mt-6">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationFirst
                    className={
                      isPagingDisabled || page === 1
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToFirstPage}
                    href="#"
                  />
                </PaginationItem>
                {pages.map((pageItem, index) => (
                  <PaginationItem
                    key={
                      pageItem === 'ellipsis' ? `ellipsis-${index}` : pageItem
                    }
                  >
                    {pageItem === 'ellipsis' ? (
                      <PaginationEllipsis />
                    ) : (
                      <PaginationLink
                        href="#"
                        isActive={pageItem === page}
                        onClick={event => handleNavigateToPage(event, pageItem)}
                      >
                        {pageItem}
                      </PaginationLink>
                    )}
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationLast
                    className={
                      isPagingDisabled || page === totalPages
                        ? 'pointer-events-none opacity-50'
                        : ''
                    }
                    onClick={handleNavigateToLastPage}
                    href="#"
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
