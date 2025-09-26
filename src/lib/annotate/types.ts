import type { AnnotationStatus, AnnotationTaskStatus } from '@/lib/entities/annotation';

export interface AnnotationTasksListFilters {
  page?: number;
  limit?: number;
  taskTitle?: string;
  taskStatus?: AnnotationTaskStatus;
  fromDate?: string;
  toDate?: string;
}

export interface AnnotationsListFilters {
  taskId: number;
  page?: number;
  limit?: number;
  status?: AnnotationStatus;
}

