import type { QueryKey } from '@tanstack/react-query';

export const reviewKeys = {
  root: ['review'] as const,
  monthlySummary: (
    offset?: number,
    limit?: number,
    startDate?: string,
    endDate?: string,
    district?: string,
  ) =>
    [
      ...reviewKeys.root,
      'monthly-summary',
      { offset, limit, startDate, endDate, district },
    ] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;
