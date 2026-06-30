import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import {
    BOOLEAN_TRUE_DISPLAY,
    NOT_APPLICABLE,
    type MetadataRow,
} from './metadata-row';

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByMetadataRowId: Map<string, string>,
): {
    resolvedData: Partial<Session>;
    resolvedSurveillanceForm: Partial<SurveillanceForm>;
} {
    const resolvedData: Partial<Session> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};

    for (const metadataRow of metadataRows) {
        const chosenDisplayValue = resolutionsByMetadataRowId.get(
            metadataRow.id,
        );
        if (chosenDisplayValue === undefined) continue;

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

    return { resolvedData, resolvedSurveillanceForm };
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
