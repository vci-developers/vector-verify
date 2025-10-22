import type { AnnotationStatus } from '@/shared/entities/annotation/status';

export interface AnnotationTasksQuery {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface AnnotationsQuery {
  taskId: number;
  page?: number;
  limit?: number;
  status?: AnnotationStatus;
}
