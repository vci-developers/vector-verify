'use client';

import bff from '@/lib/api/bff-client';
import type {
  AnnotationUpdateRequestDto,
  AnnotationUpdateResponseDto,
} from '@/features/annotation/types';
import { createJsonRequestInit } from '@/lib/shared/http/core/json';

export async function updateAnnotation(
  annotationId: number,
  payload: AnnotationUpdateRequestDto,
): Promise<AnnotationUpdateResponseDto> {
  return await bff<AnnotationUpdateResponseDto>(
    `/annotations/${annotationId}`,
    {
      method: 'PUT',
      ...createJsonRequestInit(payload),
    },
  );
}
