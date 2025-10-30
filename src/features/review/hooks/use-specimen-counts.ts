import { useMemo } from 'react';
import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  masterTableViewKeys,
  type SpecimenCountsQueryKey,
} from '@/features/review/api/master-table-view-keys';
import { getSpecimenCounts } from '@/features/review/api/get-specimen-counts';
import { getMonthDateRange } from '@/features/review/utils/master-table-view';
import type { SpecimenCountsSummary } from '@/features/review/types';

interface UseSpecimenCountsParams {
  district?: string | null;
  monthYear?: string | null;
  sessionId?: string | null; 
}

type SpecimenCountsQueryOptions = Omit<
  UseQueryOptions<
    SpecimenCountsSummary,
    Error,
    SpecimenCountsSummary,
    SpecimenCountsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export function useSpecimenCountsQuery(
  params: UseSpecimenCountsParams = {},
  options?: SpecimenCountsQueryOptions,
) {
  const { district, monthYear, sessionId } = params; 
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
      sessionId ?? null 
    ) as SpecimenCountsQueryKey,
    queryFn: () =>
      getSpecimenCounts({
        district: district ?? undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        sessionId: sessionId ?? undefined,
      }),
    enabled: isReady && (optionsEnabled ?? true),
    ...restOptions,
  });
}
