import type { OffsetPage } from '@/shared/entities/pagination';
import type { Specimen } from '@/shared/entities/specimen/model';
import { getSpecimens } from '@/features/review/api/get-specimens';
import type { SpecimensQuery } from '@/features/review/types';
import type { UseQueryOptions } from '@tanstack/react-query';
import { useQuery } from '@tanstack/react-query';
import {
  reviewKeys,
  type SpecimensQueryKey,
} from '@/features/review/api/review-keys';

export function useSpecimensQuery(
  filters: SpecimensQuery = {},
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
    queryKey: reviewKeys.specimens(
      offset,
      limit,
      startDate,
      endDate,
      district,
      siteId,
    ) as SpecimensQueryKey,
    queryFn: () =>
      getSpecimens({
        offset,
        limit,
        startDate,
        endDate,
        district,
        siteId,
      }),
    enabled: Boolean(siteId && district && startDate && endDate), 
    ...(options ?? {}),
  });
}
