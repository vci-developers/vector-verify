import type { AnnotationDto } from '@/lib/data/dto/annotation-dto';
import type { SessionDto } from '@/lib/data/dto/session-dto';
import type { SpecimenDto } from '@/lib/data/dto/specimen-dto';

import { type AnnotationTaskDto } from '../annotation-task-dto';

export type AnnotationTaskEntryDto = {
  annotation: AnnotationDto;
  specimen: SpecimenDto;
  session: SessionDto;
};

export type AnnotationTaskWithEntriesDto = AnnotationTaskDto & {
  entries: AnnotationTaskEntryDto[];
};
