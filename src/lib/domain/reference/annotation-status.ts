export const AnnotationStatus = {
  PENDING: "PENDING",
  ANNOTATED: "ANNOTATED",
  FLAGGED: "FLAGGED",
} as const;

export type AnnotationStatus =
  (typeof AnnotationStatus)[keyof typeof AnnotationStatus];
