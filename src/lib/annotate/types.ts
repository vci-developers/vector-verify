import type { AnnotationTaskStatus } from '@/lib/entities/annotation';

export interface AnnotationTasksListFilters {
  page?: number;
  limit?: number;
  taskTitle?: string;
  taskStatus?: AnnotationTaskStatus;
}
