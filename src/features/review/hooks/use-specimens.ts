import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getSpecimens } from '@/features/review/api/get-specimens';
import {
  reviewKeys,
  type SpecimensQueryKey,
} from '@/features/review/api/review-keys';
import type { OffsetPage } from '@/shared/entities/pagination';
import type { Specimen } from '@/shared/entities/specimen/model';
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
  >,
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
    includeAllImages,
  } = filters;

  const enabled =
    (options?.enabled ?? true) &&
    Boolean(siteId && district && startDate && endDate);

  return useQuery({
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
      includeAllImages,
    ) as SpecimensQueryKey,
    queryFn: () => getSpecimens(filters),
    enabled,
    ...(options ?? {}),
  });
}
