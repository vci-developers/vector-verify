import { AnnotationStatus } from "@/lib/domain/reference/annotation-status";

export type AnnotationDto = {
  id: number;
  specimenId: number;
  taskId: number;
  morphSpecies?: string;
  morphSex?: string;
  morphAbdomenStatus?: string;
  notes?: string;
  status: AnnotationStatus;
  submittedAt?: number;
};
