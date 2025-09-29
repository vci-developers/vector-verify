import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { reviewKeys, type MonthlySummaryQueryKey } from '../../keys';
import { getMonthlySummary } from '../get-monthly-summary';
import type {
  MonthlySummaryFilters,
  MonthlySummaryResponse,
} from '../../types';

export function useMonthlySummaryQuery(
  filters: MonthlySummaryFilters = {},
  options?: Omit<
    UseQueryOptions<
      MonthlySummaryResponse,
      Error,
      MonthlySummaryResponse,
      MonthlySummaryQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  const { dateFrom, dateTo, districts } = filters;

  return useQuery({
    queryKey: reviewKeys.monthlySummary({
      dateFrom,
      dateTo,
      districts,
    }) as MonthlySummaryQueryKey,
    queryFn: () => getMonthlySummary(filters),
    ...(options ?? {}),
  });
}
