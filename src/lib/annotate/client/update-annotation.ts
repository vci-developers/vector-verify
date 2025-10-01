'use client';

import bff from '@/lib/shared/http/client/bff-client';
import type {
  AnnotationUpdateRequestDto,
  AnnotationUpdateResponseDto,
} from '@/lib/entities/annotation';
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
