import type {
  AnnotationDto,
  AnnotationExpandedDto,
  AnnotationTaskDto,
} from '@/lib/entities/annotation/dto';

export interface AnnotationsListResponseDto {
  annotations: AnnotationExpandedDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AnnotationTasksListResponseDto {
  tasks: AnnotationTaskDto[];
  total: number;
  limit: number;
  offset: number;
  hasMore: boolean;
}

export interface AnnotationUpdateResponseDto {
  message: string;
  annotation: AnnotationDto;
}

export interface AnnotationTaskProgressDto {
  taskId: number;
  total: number;
  annotated: number;
  flagged: number;
  percent: number;
}
