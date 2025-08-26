import { AnnotationDto } from "../annotation-dto";
import { SessionDto } from "../session-dto";
import { SpecimenImageDto } from "../specimen-image-dto";

export type AnnotationTaskEntryDto = {
  annotation: AnnotationDto;
  image: SpecimenImageDto;
  session: SessionDto;
};
