'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import {
  calculateDateRange,
  getDateRangeOptionFromDates,
  type DateRangeOption,
} from '@/lib/shared/utils/date-range';

export function useDateRangeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const dateRange = useMemo(() => {
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    return getDateRangeOptionFromDates(fromDate, toDate) || 'all-time';
  }, [searchParams]);

  const updateDateRange = useCallback(
    (newDateRange: DateRangeOption) => {
      const params = new URLSearchParams(searchParams.toString());

      // Remove existing date parameters
      params.delete('fromDate');
      params.delete('toDate');

      // Reset pagination to page 1 when date range changes
      params.delete('page');

      // Add new date range to URL
      params.set('dateRange', newDateRange);

      // Calculate and add date parameters
      const { fromDate, toDate } = calculateDateRange(newDateRange);
      if (fromDate) {
        params.set('fromDate', fromDate);
      }
      params.set('toDate', toDate);

      const newUrl = `${window.location.pathname}?${params.toString()}`;
      router.replace(newUrl);
    },
    [router, searchParams],
  );

  const getDateRangeParams = useCallback(() => {
    const fromDate = searchParams.get('fromDate') || undefined;
    const toDate = searchParams.get('toDate') || undefined;
    return { fromDate, toDate };
  }, [searchParams]);

  return {
    dateRange,
    updateDateRange,
    getDateRangeParams,
  };
}
