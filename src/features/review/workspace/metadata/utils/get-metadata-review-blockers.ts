import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import type { MetadataSection } from './metadata-section';
import {
    evaluateDisabledRowIds,
    evaluateUnmetRequiredRowIds,
} from './evaluate-question-answerability';

export function getMetadataReviewBlockers(
    sections: MetadataSection[],
    resolutionsByMetadataRowId: Map<string, string>,
    questionsById: Map<number, FormQuestion>,
) {
    const disabledRowIds = evaluateDisabledRowIds(
        sections,
        resolutionsByMetadataRowId,
        questionsById,
    );
    const unmetRequiredRowIds = evaluateUnmetRequiredRowIds(
        sections,
        resolutionsByMetadataRowId,
        disabledRowIds,
    );
    const unresolvedConflictCount = sections.reduce(
        (count, section) =>
            count +
            section.rows.filter(
                row =>
                    row.hasConflict &&
                    !resolutionsByMetadataRowId.has(row.id) &&
                    !disabledRowIds.has(row.id),
            ).length,
        0,
    );
    return {
        disabledRowIds,
        unmetRequiredRowIds,
        unresolvedConflictCount,
        areAllConflictsResolved:
            unresolvedConflictCount === 0 && unmetRequiredRowIds.size === 0,
    };
}
