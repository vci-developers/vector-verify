import { LLIN_BRAND_OPTIONS } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { isPrerequisiteMet } from './evaluate-prerequisite';
import {
    LLIN_BRAND_ROW_ID,
    LLIN_TYPE_ROW_ID,
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

export function evaluateRowOptionsById(
    sections: MetadataSection[],
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): Map<string, string[]> {
    const optionsByRowId = new Map<string, string[]>();
    const allRows = sections.flatMap(section => section.rows);

    const llinTypeRow = allRows.find(row => row.id === LLIN_TYPE_ROW_ID);
    const llinTypeValue = llinTypeRow
        ? resolveRowEffectiveValue(
              llinTypeRow,
              resolutionsByMetadataRowId,
              disabledRowIds,
          )
        : null;

    if (llinTypeValue) {
        const llinBrandOptions = LLIN_BRAND_OPTIONS.filter(
            brand => brand.type === llinTypeValue,
        ).map(brand => brand.label);
        if (llinBrandOptions.length > 0) {
            optionsByRowId.set(LLIN_BRAND_ROW_ID, llinBrandOptions);
        }
    }

    return optionsByRowId;
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
