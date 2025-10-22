import type { AnnotationStatus } from '@/shared/entities/annotation/status';

export interface AnnotationTasksListRequestDto {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}

export interface AnnotationsListRequestDto {
  taskId: number;
  page?: number;
  limit?: number;
  status?: AnnotationStatus;
}

export interface AnnotationUpdateRequestDto {
  morphSpecies?: string | null;
  morphSex?: string | null;
  morphAbdomenStatus?: string | null;
  notes?: string | null;
  status: AnnotationStatus;
}
