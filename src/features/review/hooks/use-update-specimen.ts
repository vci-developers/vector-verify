'use client';

import { useMutation, type UseMutationOptions } from '@tanstack/react-query';
import { updateSpecimen } from '@/features/review/api/update-specimen';
import type {
  SpecimenUpdateRequestDto,
  SpecimenUpdateResponseDto,
} from '@/features/review/types';

export function useUpdateSpecimennMutation(
  options?: Omit<
    UseMutationOptions<
      SpecimenUpdateResponseDto,
      Error,
      { specimenId: number; thumbnailImageId: number; payload: SpecimenUpdateRequestDto },
      unknown
    >,
    'mutationFn'
  >,
) {
  return useMutation<
    SpecimenUpdateResponseDto,
    Error,
    { specimenId: number; thumbnailImageId: number; payload: SpecimenUpdateRequestDto }
  >({
    mutationFn: ({ specimenId, thumbnailImageId, payload }) =>
      updateSpecimen(specimenId, thumbnailImageId, payload),
    ...(options ?? {}),
  });
}