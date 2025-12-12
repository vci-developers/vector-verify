import { useQuery, type UseQueryOptions } from '@tanstack/react-query';
import {
  reviewKeys,
  type SpecimenImagesQueryKey,
} from '@/features/review/api/review-keys';
import {
  getSpecimenImages,
  type SpecimenImagesResponse,
} from '@/features/review/api/get-specimen-images';

export function useSpecimenImagesQuery(
  specimenId: number | null | undefined,
  options?: Omit<
    UseQueryOptions<
      SpecimenImagesResponse,
      Error,
      SpecimenImagesResponse,
      SpecimenImagesQueryKey
    >,
    'queryKey' | 'queryFn'
  >,
) {
  return useQuery({
    queryKey: reviewKeys.specimenImages(
      specimenId ?? 0,
    ) as SpecimenImagesQueryKey,
    queryFn: () => getSpecimenImages(specimenId!),
    enabled: Boolean(specimenId) && (options?.enabled ?? true),
    ...options,
  });
}
