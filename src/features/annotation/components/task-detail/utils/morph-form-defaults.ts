import type { Annotation } from '@/shared/entities/annotation/model';

export interface MorphFormDefaultValues {
  received: boolean;
  species?: string;
  sex?: string;
  abdomenStatus?: string;
}

export function getMorphFormDefaultValues(
  annotation: Annotation,
): MorphFormDefaultValues {
  const hasMorphData =
    annotation.morphSpecies &&
    annotation.morphSex &&
    annotation.morphAbdomenStatus;
  const received = Boolean(hasMorphData);

  return {
    received,
    species: received ? annotation.morphSpecies ?? undefined : undefined,
    sex: received ? annotation.morphSex ?? undefined : undefined,
    abdomenStatus: received
      ? annotation.morphAbdomenStatus ?? undefined
      : undefined,
  };
}
