import { ARTIFACT_VISUAL_IDS } from '../annotation-form-panel/validation/annotation-form-schema';

export function parseNotesForArtifact(notes?: string | null): {
  artifact?: string;
  notes?: string;
} {
  if (!notes) return { artifact: undefined, notes: undefined };

  const artifactValues = Object.values(ARTIFACT_VISUAL_IDS);
  const isKnownArtifact =
    artifactValues.includes(
      notes as (typeof ARTIFACT_VISUAL_IDS)[keyof typeof ARTIFACT_VISUAL_IDS],
    ) && notes !== ARTIFACT_VISUAL_IDS.OTHER;

  if (isKnownArtifact) {
    return { artifact: notes, notes: undefined };
  }

  return { artifact: ARTIFACT_VISUAL_IDS.OTHER, notes };
}
