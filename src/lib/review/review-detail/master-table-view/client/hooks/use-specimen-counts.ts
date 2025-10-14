import { useMemo } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  masterTableViewKeys,
  type SpecimenCountsQueryKey,
} from '../../keys';
import { getSpecimenCounts } from '../get-specimen-counts';
import { getMonthDateRange } from '../../utils';
import type { SpecimenCountsResponse } from '../../types';

interface UseSpecimenCountsParams {
  district?: string | null;
  monthYear?: string | null;
}

type SpecimenCountsQueryOptions = Omit<
  UseQueryOptions<
    SpecimenCountsResponse,
    Error,
    SpecimenCountsResponse,
    SpecimenCountsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export function useSpecimenCountsQuery(
  params: UseSpecimenCountsParams = {},
  options?: SpecimenCountsQueryOptions,
) {
  const { district, monthYear } = params;
  const dateRange = useMemo(() => getMonthDateRange(monthYear), [monthYear]);

  const startDate = dateRange?.startDate ?? null;
  const endDate = dateRange?.endDate ?? null;
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};

  const isReady = Boolean(district && startDate && endDate);

  return useQuery({
    queryKey: masterTableViewKeys.specimenCounts(
      district ?? null,
      startDate,
      endDate,
    ) as SpecimenCountsQueryKey,
    queryFn: () =>
      getSpecimenCounts({
        district: district ?? undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
      }),
    enabled: isReady && (optionsEnabled ?? true),
    ...restOptions,
  });
}
