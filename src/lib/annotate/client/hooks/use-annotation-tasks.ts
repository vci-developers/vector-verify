import { useQuery } from '@tanstack/react-query';
import {
  annotationKeys,
  type AnnotationTasksQueryKey,
} from '@/lib/annotate/keys';
import { getAnnotationTasks } from '@/lib/annotate/client';

export function useAnnotationTasksQuery(options: {
  page?: number;
  limit?: number;
  taskTitle?: string;
  taskStatus?: string;
}) {
  return useQuery({
    queryKey: annotationKeys.tasks(
      options.page ?? 1,
      options.limit ?? 20,
      options.taskStatus,
    ) as AnnotationTasksQueryKey,
    queryFn: () => getAnnotationTasks(options),
  });
}
