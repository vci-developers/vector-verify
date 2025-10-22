import type { OffsetPage } from '@/shared/entities/pagination';
import type {
  Annotation,
  AnnotationTask,
  AnnotationTaskProgress,
} from '@/shared/entities/annotation/model';
import {
  mapAnnotationDtoToModel,
  mapAnnotationTaskDtoToModel,
} from '@/shared/entities/annotation/mapper';
import type {
  AnnotationTaskProgressDto,
  AnnotationsListResponseDto,
  AnnotationTasksListResponseDto,
} from './response.dto';

export { mapAnnotationDtoToModel, mapAnnotationTaskDtoToModel } from '@/shared/entities/annotation/mapper';

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

export function mapAnnotationTasksListResponseDtoToPage(
  dto: AnnotationTasksListResponseDto,
): OffsetPage<AnnotationTask> {
  return {
    items: dto.tasks.map(mapAnnotationTaskDtoToModel),
    total: dto.total,
    limit: dto.limit,
    offset: dto.offset,
    hasMore: dto.hasMore,
  };
}

export function mapAnnotationTaskProgressDtoToModel(
  dto: AnnotationTaskProgressDto,
): AnnotationTaskProgress {
  return {
    taskId: dto.taskId,
    total: dto.total,
    annotated: dto.annotated,
    flagged: dto.flagged,
    percent: dto.percent,
  };
}
