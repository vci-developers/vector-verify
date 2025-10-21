import type {
  AnnotationDto,
  AnnotationExpandedDto,
  AnnotationTaskDto,
} from '@/lib/entities/annotation/dto';
import type { Annotation, AnnotationTask } from '@/lib/entities/annotation/model';
import { mapSpecimenExpandedDtoToModel } from '@/lib/entities/specimen/mapper';

export function mapAnnotationDtoToModel(
  dto: AnnotationDto | AnnotationExpandedDto,
): Annotation {
  const base: Annotation = {
    id: dto.id,
    annotationTaskId: dto.annotationTaskId,
    annotatorId: dto.annotatorId,
    specimenId: dto.specimenId,
    morphSpecies: dto.morphSpecies,
    morphSex: dto.morphSex,
    morphAbdomenStatus: dto.morphAbdomenStatus,
    notes: dto.notes,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };

  if ('annotationTask' in dto) {
    base.annotationTask = mapAnnotationTaskDtoToModel(dto.annotationTask);
    base.specimen = mapSpecimenExpandedDtoToModel(dto.specimen);
  }

  return base;
}

export function mapAnnotationTaskDtoToModel(
  dto: AnnotationTaskDto,
): AnnotationTask {
  return {
    id: dto.id,
    userId: dto.userId,
    title: dto.title,
    description: dto.description,
    status: dto.status,
    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,
  };
}
