import {
  AnnotationTask,
  AnnotationTasksListResponseDto,
  mapAnnotationTasksListResponseDtoToPage,
} from '@/lib/entities/annotation';
import { OffsetPage } from '@/lib/entities/pagination';
import bff from '@/lib/shared/http/client/bff-client';

export async function getAnnotationTasks(options: {
  page?: number;
  limit?: number;
  taskTitle?: string;
  taskStatus?: string;
}): Promise<OffsetPage<AnnotationTask>> {
  const search = new URLSearchParams();
  search.set('page', String(options.page ?? 1));
  search.set('limit', String(options.limit ?? 20));
  if (options.taskTitle) search.set('title', options.taskTitle);
  if (options.taskStatus) search.set('status', options.taskStatus);

  const data = await bff<AnnotationTasksListResponseDto>(
    `/annotations/task?${search.toString()}`,
    {
      method: 'GET',
    },
  );

  return mapAnnotationTasksListResponseDtoToPage(data);
}
