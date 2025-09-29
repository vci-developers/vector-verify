import type { MonthlySummaryFilters } from './types';

export const reviewKeys = {
  all: ['review'] as const,
  monthlySummary: (filters: MonthlySummaryFilters = {}) =>
    [
      ...reviewKeys.all,
      'monthly-summary',
      filters.dateFrom,
      filters.dateTo,
      filters.districts,
    ] as const,
  districts: () => [...reviewKeys.all, 'districts'] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
>;
export type DistrictsQueryKey = ReturnType<typeof reviewKeys.districts>;
