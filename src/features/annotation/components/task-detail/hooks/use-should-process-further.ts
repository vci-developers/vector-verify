import { useQuery } from '@tanstack/react-query';
import { annotationKeys, getSpecimen } from '@/features/annotation/api';
import type { Specimen } from '@/shared/entities/specimen/model';

export function useShouldProcessFurther(specimen?: Specimen | null) {
  const specimenId = specimen?.id;
  const shouldFetch =
    specimenId !== undefined &&
    specimenId !== null &&
    specimen?.shouldProcessFurther === undefined;

  const query = useQuery({
    queryKey: annotationKeys.specimen(specimenId ?? 0),
    queryFn: () => getSpecimen(specimenId as number),
    enabled: shouldFetch,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const remoteValue = query.data?.shouldProcessFurther;
  const localValue =
    specimen?.shouldProcessFurther === undefined
      ? undefined
      : specimen.shouldProcessFurther;

  return {
    shouldProcessFurther: localValue ?? remoteValue ?? false,
    isLoading: shouldFetch && query.isPending,
  };
}
