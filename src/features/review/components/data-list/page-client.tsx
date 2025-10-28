'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/ui/card';
import { DateRangeFilter } from '@/shared/components/date-range-filter';
import { DistrictFilter } from './district-filter';
import { ReviewTable } from './review-table';
import { ReviewDataListLoadingSkeleton } from './loading-skeleton';
import { calculateDateRange, toDateOnly } from '@/shared/core/utils/date-range';
import { useMonthlySummaryQuery } from '@/features/review/hooks/use-monthly-summary';
import { usePagination } from '@/shared/core/hooks/use-pagination';
import { PAGE_SIZES } from '@/shared/entities/pagination';
import { useUserProfileQuery, useUserPermissionsQuery } from '@/features/user';
import {
  getAccessibleDistricts,
  normalizeDistrictList,
} from '@/features/review/utils/district-access';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/ui/select';
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationFirst,
  PaginationLast,
} from '@/ui/pagination';
import type { DateRangeOption } from '@/shared/core/utils/date-range';

export function ReviewDataListPageClient() {
  const [dateRange, setDateRange] = useState<DateRangeOption>('all-time');
  const [selectedDistrict, setSelectedDistrict] = useState<string | null>(null);

  const { createdAfter, createdBefore } = useMemo(
    () => calculateDateRange(dateRange),
    [dateRange],
  );

  const { data: user } = useUserProfileQuery();
  const { data: permissions } = useUserPermissionsQuery();
  const pagination = usePagination({});
  const {
    setTotal,
    page,
    setPage,
    pageSize,
    setPageSizeAndReset,
    totalPages,
    range: pages,
    start: offset,
  } = pagination;

  const startDate = toDateOnly(createdAfter);
  const endDate = toDateOnly(createdBefore);

  const { data, isLoading, isFetching } = useMonthlySummaryQuery({
    offset,
    limit: pageSize,
    startDate,
    endDate,
    district: selectedDistrict || undefined,
  });

  const summaries = data?.data?.items ?? [];
  const totalFromServer = data?.data?.total;

  const normalizedDistrictsFromResponse = useMemo(
    () => normalizeDistrictList(data?.availableDistricts),
    [data?.availableDistricts],
  );

  const [persistedAvailableDistricts, setPersistedAvailableDistricts] =
    useState<string[]>([]);

  useEffect(() => {
    if (!normalizedDistrictsFromResponse.length) return;

    setPersistedAvailableDistricts(prevDistricts => {
      const merged = normalizeDistrictList([
        ...prevDistricts,
        ...normalizedDistrictsFromResponse,
      ]);

      const isUnchanged =
        merged.length === prevDistricts.length &&
        merged.every((district, index) => district === prevDistricts[index]);

      return isUnchanged ? prevDistricts : merged;
    });
  }, [normalizedDistrictsFromResponse]);

  const availableDistricts = useMemo(() => {
    if (persistedAvailableDistricts.length) return persistedAvailableDistricts;
    return normalizedDistrictsFromResponse;
  }, [persistedAvailableDistricts, normalizedDistrictsFromResponse]);

  const accessibleDistricts = useMemo(() => {
    if (!availableDistricts.length) return [] as string[];
    if (!user || !permissions) return availableDistricts;
    return getAccessibleDistricts(availableDistricts, user, permissions);
  }, [availableDistricts, permissions, user]);

  useEffect(() => {
    if (
      selectedDistrict &&
      accessibleDistricts.length > 0 &&
      !accessibleDistricts.includes(selectedDistrict)
    ) {
      setSelectedDistrict(null);
    }
  }, [accessibleDistricts, selectedDistrict]);

  useEffect(() => {
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
    setPage(1);
  }

  function handleDistrictSelected(district: string | null) {
    setSelectedDistrict(district);
    setPage(1);
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

  function handleNavigateToReview(district: string, monthYear: string) {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMonthYear = encodeURIComponent(monthYear);
    window.location.href = `/review/${encodedDistrict}/${encodedMonthYear}`;
  }

  function handleNavigateToDashboard(district: string, monthYear: string) {
    const encodedDistrict = encodeURIComponent(district);
    const encodedMonthYear = encodeURIComponent(monthYear);
    window.location.href = `/review/${encodedDistrict}/${encodedMonthYear}/dashboard`;
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
              onDistrictSelected={handleDistrictSelected}
              disabled={
                isLoading || isFetching || accessibleDistricts.length === 0
              }
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
            onNavigateToDashboard={handleNavigateToDashboard}
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
