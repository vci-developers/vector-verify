import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { isPrerequisiteMet } from './evaluate-prerequisite';
import { NOT_APPLICABLE, type MetadataSection } from './metadata-section';

const SURVEILLANCE_FIELD_DEPENDENCIES: Record<
    string,
    { dependentRowIds: string[]; disablingDisplayValues: string[] }
> = {
    'surveillanceForm.wasIrsConducted': {
        dependentRowIds: ['surveillanceForm.monthsSinceIrs'],
        disablingDisplayValues: ['No', NOT_APPLICABLE],
    },
    'surveillanceForm.numLlinsAvailable': {
        dependentRowIds: [
            'surveillanceForm.llinType',
            'surveillanceForm.llinBrand',
            'surveillanceForm.numPeopleSleptUnderLlin',
        ],
        disablingDisplayValues: ['0', NOT_APPLICABLE],
    },
};

export function evaluateDisabledRowIds(
    sections: MetadataSection[],
    resolutionsByMetadataRowId: Map<string, string>,
    questionsById: Map<number, FormQuestion>,
): Set<string> {
    const disabledRowIds = new Set<string>();

    for (const [parentRowId, dependency] of Object.entries(
        SURVEILLANCE_FIELD_DEPENDENCIES,
    )) {
        const parentResolution =
            resolutionsByMetadataRowId.get(parentRowId) ?? '';
        if (dependency.disablingDisplayValues.includes(parentResolution)) {
            for (const dependentRowId of dependency.dependentRowIds) {
                disabledRowIds.add(dependentRowId);
            }
        }
    }

    let disabledAnyRow = true;
    while (disabledAnyRow) {
        disabledAnyRow = false;
        for (const section of sections) {
            for (const row of section.rows) {
                if (row.entity !== 'formAnswer' || disabledRowIds.has(row.id)) {
                    continue;
                }
                const prerequisite = questionsById.get(
                    Number(row.fieldName),
                )?.prerequisite;
                if (!prerequisite) continue;
                const met = isPrerequisiteMet(prerequisite, questionId =>
                    resolveEffectiveValue(
                        questionId,
                        section,
                        resolutionsByMetadataRowId,
                        disabledRowIds,
                    ),
                );
                if (!met) {
                    disabledRowIds.add(row.id);
                    disabledAnyRow = true;
                }
            }
        }
    }

    return disabledRowIds;
}

function resolveEffectiveValue(
    questionId: number,
    section: MetadataSection,
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): string | null | undefined {
    const row = section.rows.find(
        candidate => Number(candidate.fieldName) === questionId,
    );
    if (!row) return undefined;
    if (disabledRowIds.has(row.id)) return null;

    const resolution = resolutionsByMetadataRowId.get(row.id);
    if (resolution !== undefined) {
        return resolution === NOT_APPLICABLE ? null : resolution;
    }

    const distinctValues = new Set(
        [...row.fieldValueBySessionId.values()].map(value =>
            value == null ? null : String(value),
        ),
    );
    if (distinctValues.size !== 1) return undefined;
    const [onlyValue] = distinctValues;
    return onlyValue ?? null;
}
