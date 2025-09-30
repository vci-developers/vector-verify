import type { QueryKey } from '@tanstack/react-query';

export const reviewKeys = {
  root: ['review'] as const,
  monthlySummary: (
    page?: number,
    limit?: number,
    dateFrom?: string,
    dateTo?: string,
    district?: string,
  ) =>
    [
      ...reviewKeys.root,
      'monthly-summary',
      { page, limit, dateFrom, dateTo, district },
    ] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;
