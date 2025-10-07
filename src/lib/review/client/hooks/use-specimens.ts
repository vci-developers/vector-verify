import type { OffsetPage } from '@/lib/entities/pagination';
import type { Specimen } from '@/lib/entities/specimen/model';
import { getSpecimens } from '../get-specimens';
import type { SpecimensListFilters } from '@/lib/review/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import { reviewKeys, type SpecimensQueryKey } from '@/lib/review/keys';

export function useSpecimensQuery(
  filters: SpecimensListFilters = {},
  options?: Omit<
    UseQueryOptions<OffsetPage<Specimen>, Error, OffsetPage<Specimen>, SpecimensQueryKey>,
    'queryKey' | 'queryFn'
  >
) {
  const { offset, limit, dateFrom, dateTo, district } = filters;

  return useQuery({
    queryKey: reviewKeys.specimens(offset, limit, dateFrom, dateTo, district) as SpecimensQueryKey,
    queryFn: () => getSpecimens(filters),
    enabled: Boolean(district && dateFrom && dateTo),
    ...(options ?? {}),
  });
}

