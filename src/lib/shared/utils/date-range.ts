import { useMemo } from 'react';

export type DateRangeOption =
  | '1-month'
  | '3-months'
  | '6-months'
  | '1-year'
  | 'all-time';

export interface DateRange {
  fromDate?: string;
  toDate: string;
}

export const DATE_RANGE_OPTIONS = [
  { value: '1-month' as const, label: 'Last 1 Month' },
  { value: '3-months' as const, label: 'Last 3 Months' },
  { value: '6-months' as const, label: 'Last 6 Months' },
  { value: '1-year' as const, label: 'Last 1 Year' },
  { value: 'all-time' as const, label: 'All Time' },
] as const;

export function calculateDateRange(option: DateRangeOption): DateRange {
  const now = new Date();
  const toDate = now.toISOString();

  if (option === 'all-time') {
    return { toDate };
  }

  const fromDate = new Date(now);

  switch (option) {
    case '1-month':
      fromDate.setMonth(fromDate.getMonth() - 1);
      break;
    case '3-months':
      fromDate.setMonth(fromDate.getMonth() - 3);
      break;
    case '6-months':
      fromDate.setMonth(fromDate.getMonth() - 6);
      break;
    case '1-year':
      fromDate.setFullYear(fromDate.getFullYear() - 1);
      break;
  }

  return {
    fromDate: fromDate.toISOString(),
    toDate,
  };
}

export function getDateRangeOptionFromDates(
  fromDate?: string,
  toDate?: string,
): DateRangeOption | null {
  if (!fromDate || !toDate) {
    return fromDate === undefined && toDate === undefined ? 'all-time' : null;
  }

  const from = new Date(fromDate);
  const to = new Date(toDate);
  const now = new Date();

  // Check if toDate is close to now (within 1 minute)
  const timeDiff = Math.abs(to.getTime() - now.getTime());
  if (timeDiff > 60000) {
    // More than 1 minute difference
    return null;
  }

  const monthsDiff =
    (now.getFullYear() - from.getFullYear()) * 12 +
    (now.getMonth() - from.getMonth());

  if (monthsDiff <= 1) return '1-month';
  if (monthsDiff <= 3) return '3-months';
  if (monthsDiff <= 6) return '6-months';
  if (monthsDiff <= 12) return '1-year';

  return null;
}

/**
 * Hook to get memoized ISO date values from a date range option
 * This keeps react-query caching stable by ensuring consistent date values
 */
export function useDateRangeValues(option: DateRangeOption) {
  return useMemo(() => {
    return calculateDateRange(option);
  }, [option]);
}