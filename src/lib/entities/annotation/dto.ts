import type { SpecimenExpandedDto } from '@/lib/entities/specimen/dto';
import type {
  AnnotationStatus,
  AnnotationTaskStatus,
} from '@/lib/entities/annotation/status';

export interface AnnotationTaskDto {
  id: number;
  userId: number;
  title: string | null;
  description: string | null;
  status: AnnotationTaskStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AnnotatorDto {
  id: number;
  email: string;
}

export interface AnnotationDto {
  id: number;
  annotationTaskId: number;
  annotatorId: number;
  specimenId: number;
  morphSpecies: string | null;
  morphSex: string | null;
  morphAbdomenStatus: string | null;
  notes: string | null;
  status: AnnotationStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AnnotationExpandedDto extends AnnotationDto {
  annotationTask: AnnotationTaskDto;
  annotator: AnnotatorDto;
  specimen: SpecimenExpandedDto;
}

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
