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

  specimens: (
    offset?: number,
    limit?: number,
    dateFrom?: string, 
    dateTo?: string, 
    district?: string,
  ) =>
    [
      ...reviewKeys.root,
      'specimens',
      { offset, limit, dateFrom, dateTo, district },
    ] as const,
} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;



export type SpecimensQueryKey = ReturnType<typeof reviewKeys.specimens> & QueryKey;
