import type { OffsetPage } from '@/lib/entities/pagination';
import type { Specimen } from '@/lib/entities/specimen/model';
import { getSpecimens } from '@/features/review/api/get-specimens';
import type { SpecimensListFilters } from '@/features/review/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
  reviewKeys,
  type SpecimensQueryKey,
} from '@/features/review/api/review-keys';

export function useSpecimensQuery(
  filters: SpecimensListFilters = {},
  options?: Omit<
    UseQueryOptions<
    OffsetPage<Specimen>, 
    Error, 
    OffsetPage<Specimen>, 
    SpecimensQueryKey
    >,
    'queryKey' | 'queryFn'
  >
) {
  const { offset, limit, startDate, endDate, district, siteId } = filters;

  return useQuery({
    queryKey: reviewKeys.specimens(offset, limit, startDate, endDate, district, siteId) as SpecimensQueryKey,
    queryFn: () => getSpecimens(filters),
    enabled: Boolean(siteId && district && startDate && endDate), 
    ...(options ?? {}),
  });
}
