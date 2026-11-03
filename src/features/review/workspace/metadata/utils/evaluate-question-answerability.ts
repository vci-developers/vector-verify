import { LLIN_BRAND_OPTIONS } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { collectionMethodSchema } from '@/api/session/validation/session-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import { isPrerequisiteMet } from './evaluate-prerequisite';
import {
    BOOLEAN_TRUE_DISPLAY,
    COLLECTION_METHOD_ROW_ID,
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
                    questionId =>
                        resolvePrerequisiteValue(
                            questionId,
                            section,
                            resolutionsByMetadataRowId,
                            disabledRowIds,
                        ),
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

function resolvePrerequisiteValue(
    questionId: number,
    section: MetadataSection,
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): string | null | undefined {
    const row = section.rows.find(
        candidate => Number(candidate.fieldName) === questionId,
    );
    if (!row) return undefined;
    const effectiveValue = resolveRowEffectiveValue(
        row,
        resolutionsByMetadataRowId,
        disabledRowIds,
    );
    if (row.fieldType !== 'boolean' || effectiveValue == null) {
        return effectiveValue;
    }
    return String(effectiveValue === BOOLEAN_TRUE_DISPLAY);
}

export function evaluateRowOptionsById(
    rows: MetadataRow[],
    resolutionsByMetadataRowId: Map<string, string>,
    disabledRowIds: Set<string>,
): Map<string, string[]> {
    const optionsByRowId = new Map<string, string[]>();

    const llinTypeRow = rows.find(row => row.id === LLIN_TYPE_ROW_ID);
    const llinTypeValue = llinTypeRow
        ? resolveRowEffectiveValue(
              llinTypeRow,
              resolutionsByMetadataRowId,
              disabledRowIds,
          )
        : null;

    const hasTypedLlinBrandMatch = LLIN_BRAND_OPTIONS.some(
        brand => brand.type === llinTypeValue,
    );
    if (llinTypeValue && hasTypedLlinBrandMatch) {
        const llinBrandOptions = LLIN_BRAND_OPTIONS.filter(
            brand => brand.type === llinTypeValue || brand.type === null,
        ).map(brand => brand.label);
        optionsByRowId.set(LLIN_BRAND_ROW_ID, llinBrandOptions);
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
    questionsById: Map<number, FormQuestion>,
    currentFormSessionIds: Set<number>,
): Set<string> {
    const unmetRequiredRowIds = new Set<string>();
    const optionsByRowId = evaluateRowOptionsById(
        sections.flatMap(section => section.rows),
        resolutionsByMetadataRowId,
        disabledRowIds,
    );

    for (const section of sections) {
        const outdatedQuestionKeys = new Set(
            section.rows
                .filter(row => row.isOutdated)
                .map(row => row.questionKey),
        );
        for (const row of section.rows) {
            const isAskedOfAnySession =
                row.entity !== 'formAnswer' ||
                !!questionsById.get(Number(row.fieldName))?.prerequisite ||
                (row.questionKey !== null &&
                    outdatedQuestionKeys.has(row.questionKey)) ||
                [...row.fieldValueBySessionId].some(
                    ([sessionId, fieldValue]) =>
                        currentFormSessionIds.has(sessionId) ||
                        formatDisplayValue(fieldValue, row.fieldType) !==
                            NOT_APPLICABLE,
                );
            if (
                row.isUnitIdentityComponent ||
                disabledRowIds.has(row.id) ||
                !isAskedOfAnySession
            )
                continue;

            const effectiveValue = resolveRowEffectiveValue(
                row,
                resolutionsByMetadataRowId,
                disabledRowIds,
            );
            const allowedOptions = optionsByRowId.get(row.id);
            const isEffectiveValueDisallowed =
                !!effectiveValue &&
                !!allowedOptions &&
                !allowedOptions.includes(effectiveValue);
            const isRequiredValueMissing =
                row.required &&
                (effectiveValue === null || isEffectiveValueDisallowed);
            const isOtherTextMissing =
                row.id === COLLECTION_METHOD_ROW_ID &&
                effectiveValue?.trim() === collectionMethodSchema.enum.Other;
            if (isRequiredValueMissing || isOtherTextMissing) {
                unmetRequiredRowIds.add(row.id);
            }
        }
    }

    return unmetRequiredRowIds;
}
