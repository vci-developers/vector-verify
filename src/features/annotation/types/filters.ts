import type { AnnotationStatus, AnnotationTaskStatus } from '@/features/annotation/types/status';

export interface AnnotationTasksListFilters {
  page?: number;
  limit?: number;
  taskTitle?: string;
  taskStatus?: AnnotationTaskStatus;
  createdAfter?: string;
  createdBefore?: string;
}

export interface AnnotationsListFilters {
  taskId: number;
  page?: number;
  limit?: number;
  status?: AnnotationStatus;
}
