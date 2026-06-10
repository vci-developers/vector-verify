import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type {
    ResolvedFormAnswer,
    ResolvedSessionData,
} from '@/api/session/validation/resolve-session-conflicts-schema';
import { numberFieldNames } from '@/features/review/site-details/metadata-review/utils/metadata-fields';
import {
    formatDisplayValue,
    parseFormAnswerValue,
} from '@/features/review/site-details/metadata-review/utils/metadata-values';
import type { MetadataRow } from '@/features/review/site-details/metadata-review/utils/metadata-row-types';

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByRowId: Map<string, string>,
) {
    const resolvedSession: Partial<ResolvedSessionData> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};
    const resolvedFormAnswers: ResolvedFormAnswer[] = [];
    const unitFormAnswersByUnitIdentity = new Map<
        string,
        ResolvedFormAnswer[]
    >();

    for (const metadataRow of metadataRows) {
        const selectedFieldDisplay = resolutionsByRowId.get(metadataRow.id);
        if (selectedFieldDisplay === undefined) continue;

        if (
            metadataRow.entity === 'formAnswer' ||
            metadataRow.entity === 'unitFormAnswer'
        ) {
            const resolvedFormAnswer: ResolvedFormAnswer = {
                questionId: metadataRow.questionId,
                value: parseFormAnswerValue(
                    selectedFieldDisplay,
                    metadataRow.dataType,
                ),
                dataType: metadataRow.dataType,
            };
            if (metadataRow.entity === 'unitFormAnswer') {
                const existing =
                    unitFormAnswersByUnitIdentity.get(
                        metadataRow.unitIdentity,
                    ) ?? [];
                existing.push(resolvedFormAnswer);
                unitFormAnswersByUnitIdentity.set(
                    metadataRow.unitIdentity,
                    existing,
                );
            } else {
                resolvedFormAnswers.push(resolvedFormAnswer);
            }
            continue;
        }

        const existingSessionFieldValue = [
            ...metadataRow.fieldValueBySessionId.values(),
        ].find(value => formatDisplayValue(value) === selectedFieldDisplay);

        let resolvedFieldValue: unknown;
        if (existingSessionFieldValue !== undefined) {
            resolvedFieldValue = existingSessionFieldValue;
        } else if (selectedFieldDisplay === 'N/A') {
            resolvedFieldValue = null;
        } else if (numberFieldNames.has(metadataRow.fieldName)) {
            resolvedFieldValue = parseInt(selectedFieldDisplay, 10);
        } else {
            resolvedFieldValue = selectedFieldDisplay;
        }

        if (metadataRow.entity === 'session') {
            Object.assign(resolvedSession as Record<string, unknown>, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        }
    }

    return {
        resolvedSession,
        resolvedSurveillanceForm,
        resolvedFormAnswers,
        unitFormAnswersByUnitIdentity,
    };
}
