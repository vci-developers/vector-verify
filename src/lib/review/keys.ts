import type { QueryKey } from '@tanstack/react-query';

export const reviewKeys = {
  root: ['review'] as const,
  monthlySummary: (
    offset?: number,
    limit?: number,
    from?: string,
    to?: string,
    district?: string,
  ) =>
    [
      ...reviewKeys.root,
      'monthly-summary',
      { offset, limit, from, to, district },
    ] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;
