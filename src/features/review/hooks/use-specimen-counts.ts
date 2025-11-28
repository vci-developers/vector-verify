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
  sessionType?: 'SURVEILLANCE' | 'DATA_COLLECTION';
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
  const { district, monthYear, sessionId, sessionType } = params;
  const dateRange = useMemo(() => getMonthDateRange(monthYear), [monthYear]);

  const startDate = dateRange?.startDate;
  const endDate = dateRange?.endDate;
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};

  const isReady = Boolean(sessionId || (district && startDate && endDate));

  return useQuery({
    queryKey: masterTableViewKeys.specimenCounts(
      district ?? null,
      startDate ?? null,
      endDate ?? null,
      sessionId ?? null,
      sessionType ?? null,
    ) as SpecimenCountsQueryKey,
    queryFn: () =>
      getSpecimenCounts({
        district: district ?? undefined,
        startDate: startDate ?? undefined,
        endDate: endDate ?? undefined,
        sessionId: sessionId ?? undefined,
        sessionType: sessionType ?? 'SURVEILLANCE',
      }),
    enabled: isReady && (optionsEnabled ?? true),
    ...restOptions,
  });
}
