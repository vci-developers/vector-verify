export const AnnotationTaskStatusValues = [
  'PENDING',
  'IN_PROGRESS',
  'COMPLETED',
] as const;

export type AnnotationTaskStatus = (typeof AnnotationTaskStatusValues)[number];

export const AnnotationStatusValues = [
  'PENDING',
  'ANNOTATED',
  'FLAGGED',
] as const;

export type AnnotationStatus = (typeof AnnotationStatusValues)[number];
