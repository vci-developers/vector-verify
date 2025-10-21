import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  reviewKeys,
  type MonthlySummaryQueryKey,
} from '@/features/review/api/review-keys';
import { getMonthlySummary } from '@/features/review/api/get-monthly-summary';
import type { MonthlySummary, MonthlySummaryQuery } from '@/features/review/types';
import type { OffsetPage } from '@/lib/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export function useMonthlySummaryQuery(
  filters: MonthlySummaryQuery = {},
  options?: Omit<
    UseQueryOptions<
      {
        data: OffsetPage<MonthlySummary>;
        availableDistricts: string[];
      },
      Error,
      {
        data: OffsetPage<MonthlySummary>;
        availableDistricts: string[];
      },
      MonthlySummaryQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const {
    offset = 0,
    limit = DEFAULT_PAGE_SIZE,
    startDate,
    endDate,
    district,
  } = filters;

  return useQuery({
    queryKey: reviewKeys.monthlySummary(
      offset,
      limit,
      startDate,
      endDate,
      district,
    ) as MonthlySummaryQueryKey,
    queryFn: () =>
      getMonthlySummary({
        offset,
        limit,
        startDate,
        endDate,
        district,
      }),
    placeholderData: previousData => previousData, // Keep previous data while fetching
    ...(options ?? {}),
  });
}
