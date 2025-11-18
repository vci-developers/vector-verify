import { useMemo } from 'react';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';

/**
 * Unified hook for calculating date ranges from monthYear parameter.
 * Ensures consistent date calculations across all review pages.
 */
export function useMonthDateRange(monthYear?: string | null) {
  return useMemo(() => {
    return getMonthDateRange(monthYear);
  }, [monthYear]);
}

