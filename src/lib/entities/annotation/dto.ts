import type { SpecimenExpandedDto } from '@/lib/entities/specimen/dto';
import type { AnnotationStatus, AnnotationTaskStatus } from './status';

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
