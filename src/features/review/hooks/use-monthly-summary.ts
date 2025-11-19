import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  reviewKeys,
  type MonthlySummaryQueryKey,
} from '@/features/review/api/review-keys';
import { getMonthlySummary } from '@/features/review/api/get-monthly-summary';
import type { MonthlySummary, MonthlySummaryQuery } from '@/features/review/types';
import type { OffsetPage } from '@/shared/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/shared/entities/pagination';

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
  const { offset = 0, limit = DEFAULT_PAGE_SIZE, district } = filters;

  return useQuery({
    queryKey: reviewKeys.monthlySummary(offset, limit, undefined, undefined, district) as MonthlySummaryQueryKey,
    queryFn: () => getMonthlySummary({ offset, limit, district }),
    placeholderData: previousData => previousData,
    ...(options ?? {}),
  });
}
