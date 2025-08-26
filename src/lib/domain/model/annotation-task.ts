import { AnnotationTaskEntry } from "./helpers/annotation-task-entry";
import { AnnotationTaskStatus } from "../reference/annotation-task-status";

export type AnnotationTask = {
  id: number;
  createdAt: number;
  assignedTo: number;
  status: AnnotationTaskStatus;
  entries: AnnotationTaskEntry[];
};
