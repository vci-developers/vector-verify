import { Annotation } from '../annotation';
import { AnnotationTask } from '../annotation-task';
import { Session } from '../session';
import { Specimen } from '../specimen';

export type AnnotationTaskEntry = {
  annotation: Annotation;
  specimen: Specimen;
  session: Session;
};

export type AnnotationTaskWithEntries = AnnotationTask & {
  entries: AnnotationTaskEntry[];
};
