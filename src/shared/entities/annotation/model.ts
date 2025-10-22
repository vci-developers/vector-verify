import type { Specimen } from '@/shared/entities/specimen/model';
import type { AnnotationStatus, AnnotationTaskStatus } from './status';

export interface AnnotationTask {
  id: number;
  userId: number;
  title: string | null;
  description: string | null;
  status: AnnotationTaskStatus;
  createdAt: number;
  updatedAt: number;
}

export interface AnnotationTaskProgress {
  taskId: number;
  total: number;
  annotated: number;
  flagged: number;
  percent: number;
}

export interface Annotation {
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
  annotationTask?: AnnotationTask;
  specimen?: Specimen;
}
