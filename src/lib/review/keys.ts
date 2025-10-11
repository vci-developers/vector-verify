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

  specimens: (
    offset?: number,
    limit?: number,
    dateFrom?: string, 
    dateTo?: string, 
    district?: string,
    siteId?: number,
  ) =>
    [
      ...reviewKeys.root,
      'specimens',
      { offset, limit, dateFrom, dateTo, district, siteId },
    ] as const,

} as const;

export type MonthlySummaryQueryKey = ReturnType<
  typeof reviewKeys.monthlySummary
> &
  QueryKey;



export type SpecimensQueryKey = ReturnType<
  typeof reviewKeys.specimens
> & QueryKey;
