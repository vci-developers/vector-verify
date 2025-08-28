export const AnnotationTaskStatus = {
  NOT_STARTED: 'NOT_STARTED',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
} as const;

export type AnnotationTaskStatus = (typeof AnnotationTaskStatus)[keyof typeof AnnotationTaskStatus];
