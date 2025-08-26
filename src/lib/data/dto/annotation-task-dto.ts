import { AnnotationTaskEntry } from "@/lib/domain/model/helpers/annotation-task-entry";
import { AnnotationTaskStatus } from "@/lib/domain/reference/annotation-task-status";

export type AnnotationTaskDto = {
  id: number;
  createdAt: number;
  assignedTo: number;
  status: AnnotationTaskStatus;
  entries: AnnotationTaskEntry[];
};
