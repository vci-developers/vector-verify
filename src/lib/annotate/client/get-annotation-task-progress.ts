import { AnnotationTaskProgress } from '@/lib/entities/annotation';
import type { AnnotationsListResponseDto } from '@/lib/entities/annotation/dto';
import bff from '@/lib/shared/http/client/bff-client';

export async function getAnnotationTaskProgress(
  taskId: number,
  options: { statusParam?: string } = {},
): Promise<AnnotationTaskProgress> {
  const statusFilterParam = options.statusParam ?? 'status';

  const baseQueryParams = { taskId, limit: 1 } as const;
  const totalCountQuery = baseQueryParams;
  const annotatedCountQuery = {
    ...baseQueryParams,
    [statusFilterParam]: 'ANNOTATED',
  } as const;
  const flaggedCountQuery = {
    ...baseQueryParams,
    [statusFilterParam]: 'FLAGGED',
  } as const;

  const [totalResponse, annotatedResponse, flaggedResponse] = await Promise.all([
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: totalCountQuery,
    }),
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: annotatedCountQuery,
    }),
    bff<AnnotationsListResponseDto>('/annotations', {
      method: 'GET',
      query: flaggedCountQuery,
    }),
  ]);

  const totalCount = totalResponse.total ?? 0;
  const annotatedCount = annotatedResponse.total ?? 0;
  const flaggedCount = flaggedResponse.total ?? 0;
  const completedCount = annotatedCount + flaggedCount;
  const completionPercent =
    totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  return {
    taskId,
    total: totalCount,
    annotated: annotatedCount,
    flagged: flaggedCount,
    percent: completionPercent,
  };
}
