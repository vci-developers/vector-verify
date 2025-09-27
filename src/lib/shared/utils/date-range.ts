import { useMemo } from 'react';

export type DateRangeOption =
  | '1-month'
  | '3-months'
  | '6-months'
  | '1-year'
  | 'all-time';

export interface DateRange {
  createdAfter?: string;
  createdBefore: string;
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
  const createdBefore = now.toISOString();

  if (option === 'all-time') {
    return { createdBefore };
  }

  const createdAfter = new Date(now);

  switch (option) {
    case '1-month':
      createdAfter.setMonth(createdAfter.getMonth() - 1);
      break;
    case '3-months':
      createdAfter.setMonth(createdAfter.getMonth() - 3);
      break;
    case '6-months':
      createdAfter.setMonth(createdAfter.getMonth() - 6);
      break;
    case '1-year':
      createdAfter.setFullYear(createdAfter.getFullYear() - 1);
      break;
  }

  return {
    createdAfter: createdAfter.toISOString(),
    createdBefore,
  };
}

export function getDateRangeOptionFromDates(
  createdAfter?: string,
  createdBefore?: string,
): DateRangeOption | null {
  if (!createdAfter || !createdBefore) {
    return createdAfter === undefined && createdBefore === undefined
      ? 'all-time'
      : null;
  }

  const from = new Date(createdAfter);
  const to = new Date(createdBefore);
  const now = new Date();

  // Check if createdBefore is close to now (within 1 minute)
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
