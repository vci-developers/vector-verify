import { AnnotationStatus } from "@/lib/domain/reference/annotation-status";

export type AnnotationDto = {
  id: number;
  imageId: number;
  morphSpecies?: string;
  morphSex?: string;
  morphAbdomenStatus?: string;
  notes?: string;
  status: AnnotationStatus;
  submittedAt?: number;
};
