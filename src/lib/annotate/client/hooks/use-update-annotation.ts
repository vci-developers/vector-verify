'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { updateAnnotation } from '../update-annotation';
import type {
  AnnotationUpdateRequestDto,
  AnnotationUpdateResponseDto,
} from '@/lib/entities/annotation';

export function useUpdateAnnotationMutation(
  options?: Omit<
    UseMutationOptions<
      AnnotationUpdateResponseDto,
      Error,
      { annotationId: number; payload: AnnotationUpdateRequestDto },
      unknown
    >,
    'mutationFn'
  >,
) {
  return useMutation<
    AnnotationUpdateResponseDto,
    Error,
    { annotationId: number; payload: AnnotationUpdateRequestDto }
  >({
    mutationFn: ({ annotationId, payload }) =>
      updateAnnotation(annotationId, payload),
    ...(options ?? {}),
  });
}
