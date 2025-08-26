import { Annotation } from "../annotation";
import { Session } from "../session";
import { SpecimenImage } from "../specimen-image";

export type AnnotationTaskEntry = {
  annotation: Annotation;
  image: SpecimenImage;
  session: Session;
};
