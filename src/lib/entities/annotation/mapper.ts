import type {
  AnnotationDto,
  AnnotationExpandedDto,
  AnnotationsListResponseDto,
} from '@/lib/entities/annotation/dto';
import type { Annotation } from '@/lib/entities/annotation/model';
import { mapSpecimenExpandedDtoToModel } from '@/lib/entities/specimen/mapper';
import type { OffsetPage } from '@/lib/entities/pagination/model';

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
    base.annotationTask = { ...dto.annotationTask };
    base.annotator = { ...dto.annotator };
    base.specimen = mapSpecimenExpandedDtoToModel(dto.specimen);
  }
  return base;
}

export function mapAnnotationsListResponseDtoToPage(
  dto: AnnotationsListResponseDto,
): OffsetPage<Annotation> {
  return {
    items: dto.annotations.map(mapAnnotationDtoToModel),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
    hasMore: dto.hasMore,
  };
}
