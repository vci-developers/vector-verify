import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import {
    BOOLEAN_TRUE_DISPLAY,
    NOT_APPLICABLE,
    type MetadataRow,
} from './metadata-section';

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByMetadataRowId: Map<string, string>,
): {
    resolvedData: Partial<Session>;
    resolvedSurveillanceForm: Partial<SurveillanceForm>;
    resolvedFormAnswers: Partial<FormAnswer>[];
} {
    const resolvedData: Partial<Session> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};
    const resolvedFormAnswers: Partial<FormAnswer>[] = [];

    for (const metadataRow of metadataRows) {
        const chosenDisplayValue = resolutionsByMetadataRowId.get(
            metadataRow.id,
        );
        if (chosenDisplayValue === undefined) continue;

        if (metadataRow.entity === 'formAnswer') {
            resolvedFormAnswers.push({
                questionId: Number(metadataRow.fieldName),
                value:
                    chosenDisplayValue === NOT_APPLICABLE
                        ? null
                        : chosenDisplayValue,
                dataType: metadataRow.fieldType,
            });
            continue;
        }

        const resolvedFieldValue = toResolvedFieldValue(
            chosenDisplayValue,
            metadataRow.fieldType,
        );
        if (metadataRow.entity === 'session') {
            Object.assign(resolvedData, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        }
    }

    return { resolvedData, resolvedSurveillanceForm, resolvedFormAnswers };
}

function toResolvedFieldValue(
    chosenDisplayValue: string,
    fieldType: MetadataRow['fieldType'],
): string | number | boolean | null {
    if (chosenDisplayValue === NOT_APPLICABLE) return null;
    if (fieldType === 'number') return Number(chosenDisplayValue);
    if (fieldType === 'boolean')
        return chosenDisplayValue === BOOLEAN_TRUE_DISPLAY;
    return chosenDisplayValue;
}
