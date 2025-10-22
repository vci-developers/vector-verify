import type { OffsetPage } from '@/shared/entities/pagination';
import type { Specimen } from '@/shared/entities/specimen/model';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getSpecimens } from '@/features/review/api/get-specimens';
import {
  reviewKeys,
  type SpecimensQueryKey,
} from '@/features/review/api/review-keys';
import type { SpecimensQuery } from '@/features/review/types';

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
  const {
    offset,
    limit,
    startDate,
    endDate,
    district,
    siteId,
    species,
    sex,
    abdomenStatus,
  } = filters;

  const baseEnabled = Boolean(siteId && district && startDate && endDate);

  return useQuery({
    ...(options ?? {}),
    queryKey: reviewKeys.specimens(
      offset,
      limit,
      startDate,
      endDate,
      district,
      siteId,
      species,
      sex,
      abdomenStatus,
    ) as SpecimensQueryKey,
    queryFn: () =>
      getSpecimens({
        offset,
        limit,
        startDate,
        endDate,
        district,
        siteId,
        species,
        sex,
        abdomenStatus,
      }),
    enabled: (options?.enabled ?? true) && baseEnabled,
  });
}
