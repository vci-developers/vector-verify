import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { reviewKeys, type MonthlySummaryQueryKey } from '../../keys';
import { getMonthlySummary } from '../get-monthly-summary';
import type { MonthlySummaryFilters, MonthlySummary } from '../../types';
import type { OffsetPage } from '@/lib/entities/pagination';
import { DEFAULT_PAGE_SIZE } from '@/lib/shared/constants';

export function useMonthlySummaryQuery(
  filters: MonthlySummaryFilters = {},
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
  const { page = 1, limit = DEFAULT_PAGE_SIZE, from, to, district } = filters;

  return useQuery({
    queryKey: reviewKeys.monthlySummary(
      page,
      limit,
      from,
      to,
      district,
    ) as MonthlySummaryQueryKey,
    queryFn: () => getMonthlySummary(filters),
    ...(options ?? {}),
  });
}
