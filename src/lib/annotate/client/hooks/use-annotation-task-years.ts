import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import { getAnnotationTaskYears } from '@/lib/annotate/client/get-annotation-task-years';

export function useAnnotationTaskYearsQuery(
  options?: Omit<
    UseQueryOptions<number[], Error, number[]>,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: ['annotations', 'task-years'] as const,
    queryFn: getAnnotationTaskYears,
    ...(options ?? {}),
  });
}
