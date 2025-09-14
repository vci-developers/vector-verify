import type { Specimen } from '@/lib/entities/specimen/model';
import type { User } from '@/lib/entities/user/model';

export interface AnnotationTask {
  id: number;
  userId: number;
  title: string | null;
  description: string | null;
  status: string;
  createdAt: number;
  updatedAt: number;
  user?: User;
}

export interface Annotator {
  id: number;
  email: string;
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
  status: string;
  createdAt: number;
  updatedAt: number;
  annotationTask?: AnnotationTask;
  annotator?: Annotator;
  specimen?: Specimen;
}
