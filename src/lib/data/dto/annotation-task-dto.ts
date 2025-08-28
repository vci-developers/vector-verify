import { AnnotationTaskStatus } from "@/lib/domain/reference/annotation-task-status";

export type AnnotationTaskDto = {
  id: number;
  createdAt: number;
  assignedTo: number;
  status: AnnotationTaskStatus;
};
