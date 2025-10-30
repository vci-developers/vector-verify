import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { masterTableViewKeys } from '@/features/review/api/master-table-view-keys';
import {
  masterTableViewKeys,
  type SurveillanceFormsQueryKey,
} from '@/features/review/api/master-table-view-keys';
import { getSurveillanceFormsForSessions } from '@/features/review/api/get-surveillance-form';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';

type SurveillanceFormsQueryOptions = Omit<
  UseQueryOptions<
    Map<number, SurveillanceForm>,
    Error,
    Map<number, SurveillanceForm>,
    readonly [string, string, string, { sessionIds: number[] }]
    SurveillanceFormsQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export function useSurveillanceFormsQuery(
  sessionIds: number[],
  options?: SurveillanceFormsQueryOptions,
) {
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};

  return useQuery({
    queryKey: [
      ...masterTableViewKeys.root,
      'surveillance-forms',
      { sessionIds },
    ] as const,
    queryKey: masterTableViewKeys.surveillanceForms(sessionIds),
    queryFn: () => getSurveillanceFormsForSessions(sessionIds),
    enabled: sessionIds.length > 0 && (optionsEnabled ?? true),
    ...restOptions,
  });
}
