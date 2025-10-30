import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  masterTableViewKeys,
  type SurveillanceFormQueryKey,
} from '@/features/review/api/master-table-view-keys';
import { getSurveillanceForm } from '@/features/review/api/get-surveillance-form';
import type { SurveillanceForm } from '@/shared/entities/surveillance-form/model';

type SurveillanceFormQueryOptions = Omit<
  UseQueryOptions<
    SurveillanceForm | null,
    Error,
    SurveillanceForm | null,
    SurveillanceFormQueryKey
  >,
  'queryKey' | 'queryFn'
>;

export function useSurveillanceFormQuery(
  sessionId: number | null | undefined,
  options?: SurveillanceFormQueryOptions,
) {
  const { enabled: optionsEnabled, ...restOptions } = options ?? {};

  return useQuery({
    queryKey: masterTableViewKeys.surveillanceForm(sessionId ?? 0),
    queryFn: () => getSurveillanceForm(sessionId!),
    enabled: Boolean(sessionId) && (optionsEnabled ?? true),
    ...restOptions,
  });
}
