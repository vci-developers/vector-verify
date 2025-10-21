import type { AnnotationTaskProgress } from '@/features/annotation/types/model';
import type {
  AnnotationTaskProgressDto,
  AnnotationsListResponseDto,
} from '@/features/annotation/types/dto';
import { mapAnnotationTaskProgressDtoToModel } from '@/features/annotation/types/mapper';
import bff from '@/lib/api/bff-client';

export async function getAnnotationTaskProgress(
  taskId: number
): Promise<AnnotationTaskProgress> {
  const baseQuery = { taskId, limit: 1 } as const;
  const annotatedQuery = { ...baseQuery, status: 'ANNOTATED' } as const;
  const flaggedQuery = { ...baseQuery, status: 'FLAGGED' } as const;

  const [totalResponse, annotatedResponse, flaggedResponse] = await Promise.all([
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: baseQuery,
    }),
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: annotatedQuery,
    }),
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: flaggedQuery,
    }),
  ]);

  const totalCount = totalResponse.total ?? 0;
  const annotatedCount = annotatedResponse.total ?? 0;
  const flaggedCount = flaggedResponse.total ?? 0;
  const completedCount = annotatedCount + flaggedCount;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const progressDto: AnnotationTaskProgressDto = {
    taskId,
    total: totalCount,
    annotated: annotatedCount,
    flagged: flaggedCount,
    percent: completionPercent,
  };

  return mapAnnotationTaskProgressDtoToModel(progressDto);
}
