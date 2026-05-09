import type { AnnotationFormArtifact } from '@/features/annotation/task-details/validation/annotation-form-schema';

export function deserializeAnnotationFormArtifacts(
    serializedArtifacts?: string | null,
): AnnotationFormArtifact[] {
    if (!serializedArtifacts) return [];

    try {
        return JSON.parse(serializedArtifacts);
    } catch {
        return [];
    }
}

export function serializeAnnotationFormArtifacts(
    artifacts?: AnnotationFormArtifact[] | null,
): string | undefined {
    if (!artifacts || artifacts.length === 0) return undefined;

    return JSON.stringify(artifacts);
}
