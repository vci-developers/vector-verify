import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { isPrerequisiteMet } from './evaluate-prerequisite';
import {
    NOT_APPLICABLE,
    SURVEILLANCE_FIELD_DEPENDENCIES,
    formatDisplayValue,
    type MetadataRow,
    type MetadataSection,
} from './metadata-section';

export function evaluateDisabledRowIds(
    sections: MetadataSection[],
    resolutionsByMetadataRowId: Map<string, string>,
    questionsById: Map<number, FormQuestion>,
): Set<string> {
    const disabledRowIds = new Set<string>();
    const allRows = sections.flatMap(section => section.rows);

    for (const [parentRowId, dependency] of Object.entries(
        SURVEILLANCE_FIELD_DEPENDENCIES,
    )) {
        const parentRow = allRows.find(row => row.id === parentRowId);
        const parentValue = parentRow
            ? resolveRowEffectiveValue(
                  parentRow,
                  resolutionsByMetadataRowId,
                  disabledRowIds,
              )
            : null;
        if (parentValue === undefined) continue;
        const parentDisplayValue = parentValue ?? NOT_APPLICABLE;
        if (dependency.disablingDisplayValues.includes(parentDisplayValue)) {
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
                const prerequisiteMet = isPrerequisiteMet(
                    prerequisite,
                    questionId => {
                        const dependencyRow = section.rows.find(
                            candidate =>
                                Number(candidate.fieldName) === questionId,
                        );
                        return dependencyRow
                            ? resolveRowEffectiveValue(
                                  dependencyRow,
                                  resolutionsByMetadataRowId,
                                  disabledRowIds,
                              )
                            : undefined;
                    },
                );
                if (!prerequisiteMet) {
                    disabledRowIds.add(row.id);
                    disabledAnyRow = true;
                }
            }
        }
    }

    return disabledRowIds;
}

function resolveRowEffectiveValue(
    row: MetadataRow,
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): string | null | undefined {
    if (disabledRowIds.has(row.id)) return null;

    const resolution = resolutionsByMetadataRowId.get(row.id);
    if (resolution !== undefined) {
        return resolution === NOT_APPLICABLE ? null : resolution;
    }

    const distinctValues = new Set(
        [...row.fieldValueBySessionId.values()].map(value =>
            formatDisplayValue(value, row.fieldType),
        ),
    );
    if (distinctValues.size !== 1) return undefined;
    const [onlyValue] = distinctValues;
    return onlyValue === NOT_APPLICABLE ? null : onlyValue;
}

export function evaluateUnmetRequiredRowIds(
    sections: MetadataSection[],
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): Set<string> {
    const unmetRequiredRowIds = new Set<string>();

    for (const section of sections) {
        for (const row of section.rows) {
            if (!row.required || disabledRowIds.has(row.id)) continue;

            const effectiveValue = resolveRowEffectiveValue(
                row,
                resolutionsByMetadataRowId,
                disabledRowIds,
            );
            if (effectiveValue === null) {
                unmetRequiredRowIds.add(row.id);
            }
        }
    }

    return unmetRequiredRowIds;
}
