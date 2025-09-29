import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { reviewKeys, type DistrictsQueryKey } from '../../keys';
import { getDistricts } from '../get-districts';
import type { DistrictOption } from '../../types';

export function useDistrictsQuery(
  options?: Omit<
    UseQueryOptions<
      DistrictOption[],
      Error,
      DistrictOption[],
      DistrictsQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: reviewKeys.districts() as DistrictsQueryKey,
    queryFn: getDistricts,
    ...(options ?? {}),
  });
}
