import { AnnotationStatus } from '../reference/annotation-status';

export type Annotation = {
  id: number;
  morphSpecies?: string;
  morphSex?: string;
  morphAbdomenStatus?: string;
  notes?: string;
  status: AnnotationStatus;
  submittedAt?: number;
};
