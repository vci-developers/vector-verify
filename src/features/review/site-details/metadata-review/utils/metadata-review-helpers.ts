import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { GetFormAnswersBySessionIdResponseBody } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import type { ResolvedFormAnswer } from '@/api/session/validation/resolve-session-conflicts-schema';

type MetaDataFieldType = 'string' | 'number' | 'boolean';

const SESSION_FIELDS = [
    {
        fieldName: 'collectorName',
        label: 'Collector Name',
        fieldType: 'string',
    },
    {
        fieldName: 'collectorTitle',
        label: 'Collector Title',
        fieldType: 'string',
    },
    {
        fieldName: 'collectionMethod',
        label: 'Collection Method',
        fieldType: 'string',
    },
] as const satisfies readonly {
    fieldName: keyof Session;
    label: string;
    fieldType: MetaDataFieldType;
}[];

const SURVEILLANCE_FORM_FIELDS = [
    {
        fieldName: 'numPeopleSleptInHouse',
        label: 'People in House',
        fieldType: 'number',
    },
    {
        fieldName: 'wasIrsConducted',
        label: 'IRS Conducted',
        fieldType: 'boolean',
    },
    {
        fieldName: 'monthsSinceIrs',
        label: 'Months Since IRS',
        fieldType: 'number',
    },
    {
        fieldName: 'numLlinsAvailable',
        label: 'LLINs Available',
        fieldType: 'number',
    },
    {
        fieldName: 'llinType',
        label: 'LLIN Type',
        fieldType: 'string',
    },
    {
        fieldName: 'llinBrand',
        label: 'LLIN Brand',
        fieldType: 'string',
    },
    {
        fieldName: 'numPeopleSleptUnderLlin',
        label: 'People Under LLIN',
        fieldType: 'number',
    },
] as const satisfies readonly {
    fieldName: keyof SurveillanceForm;
    label: string;
    fieldType: MetaDataFieldType;
}[];

interface BaseMetadataRow {
    id: string;
    label: string;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

export interface SessionMetadataRow extends BaseMetadataRow {
    entity: 'session';
    fieldName: keyof Session;
}

export interface SurveillanceFormMetadataRow extends BaseMetadataRow {
    entity: 'surveillanceForm';
    fieldName: keyof SurveillanceForm;
}

export interface FormAnswerMetadataRow extends BaseMetadataRow {
    entity: 'formAnswer';
    questionId: number;
    dataType: string;
}

export type MetadataRow =
    | SessionMetadataRow
    | SurveillanceFormMetadataRow
    | FormAnswerMetadataRow;

const allFields = [...SESSION_FIELDS, ...SURVEILLANCE_FORM_FIELDS];

export const numberFieldNames = new Set<string>(
    allFields
        .filter(field => field.fieldType === 'number')
        .map(field => field.fieldName),
);
export const booleanFieldNames = new Set<string>(
    allFields
        .filter(field => field.fieldType === 'boolean')
        .map(field => field.fieldName),
);

export function formatDisplayValue(value: unknown): string {
    if (value == null) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function hasValueConflict(
    fieldValueBySessionId: Map<number, unknown>,
): boolean {
    return (
        new Set([...fieldValueBySessionId.values()].map(formatDisplayValue))
            .size > 1
    );
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
): MetadataRow[] {
    const metadataRows: MetadataRow[] = [];

    for (const { fieldName, label } of SESSION_FIELDS) {
        const fieldValueBySessionId = new Map(
            sessions.map(session => [session.sessionId, session[fieldName]]),
        );
        const hasConflict = hasValueConflict(fieldValueBySessionId);
        metadataRows.push({
            id: `session.${fieldName}`,
            label,
            entity: 'session',
            fieldName,
            fieldValueBySessionId,
            hasConflict,
        });
    }

    const hasAnySurveillanceForm = [
        ...surveillanceFormsBySessionId.values(),
    ].some(form => form !== null);
    if (hasAnySurveillanceForm) {
        for (const { fieldName, label } of SURVEILLANCE_FORM_FIELDS) {
            const fieldValueBySessionId = new Map(
                sessions.map(session => [
                    session.sessionId,
                    surveillanceFormsBySessionId.get(session.sessionId)?.[
                        fieldName
                    ] ?? null,
                ]),
            );
            const hasConflict = hasValueConflict(fieldValueBySessionId);
            metadataRows.push({
                id: `surveillanceForm.${fieldName}`,
                label,
                entity: 'surveillanceForm',
                fieldName,
                fieldValueBySessionId,
                hasConflict,
            });
        }
    }

    const hasAnyFormAnswers = [...formAnswersBySessionId.values()].some(
        result => result !== null,
    );
    if (hasAnyFormAnswers) {
        const questionMap = new Map<
            number,
            { label: string; dataType: string }
        >();
        for (const formAnswers of formAnswersBySessionId.values()) {
            if (formAnswers === null) continue;
            for (const answer of formAnswers.answers) {
                if (answer.answerScope !== 'SESSION') continue;
                if (!questionMap.has(answer.questionId)) {
                    questionMap.set(answer.questionId, {
                        label: answer.label ?? String(answer.questionId),
                        dataType: answer.dataType,
                    });
                }
            }
        }

        for (const [questionId, { label, dataType }] of questionMap) {
            const fieldValueBySessionId = new Map(
                sessions.map(session => {
                    const formAnswers =
                        formAnswersBySessionId.get(session.sessionId) ?? null;
                    const formAnswer = formAnswers?.answers.find(
                        answer => answer.questionId === questionId,
                    );
                    return [session.sessionId, formAnswer?.value ?? null];
                }),
            );
            const hasConflict = hasValueConflict(fieldValueBySessionId);
            metadataRows.push({
                id: `formAnswer.${questionId}`,
                label,
                entity: 'formAnswer',
                questionId,
                dataType,
                fieldValueBySessionId,
                hasConflict,
            });
        }
    }

    return metadataRows;
}

export function parseFormAnswerValue(
    displayString: string,
    dataType: string,
): unknown {
    if (displayString === 'N/A') return null;
    if (dataType === 'boolean') {
        if (displayString === 'Yes') return true;
        if (displayString === 'No') return false;
    }
    if (dataType === 'number') return Number(displayString);
    return displayString;
}

export function applyConflictResolutions(
    metadataRows: MetadataRow[],
    resolutionsByRowId: Map<string, string>,
) {
    const resolvedSession: Partial<Session> = {};
    const resolvedSurveillanceForm: Partial<SurveillanceForm> = {};
    const resolvedFormAnswers: ResolvedFormAnswer[] = [];

    for (const metadataRow of metadataRows) {
        const selectedFieldDisplay = resolutionsByRowId.get(metadataRow.id);
        if (selectedFieldDisplay === undefined) continue;

        if (metadataRow.entity === 'formAnswer') {
            resolvedFormAnswers.push({
                questionId: metadataRow.questionId,
                value: parseFormAnswerValue(
                    selectedFieldDisplay,
                    metadataRow.dataType,
                ),
                dataType: metadataRow.dataType,
            });
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
            Object.assign(resolvedSession, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        } else {
            Object.assign(resolvedSurveillanceForm, {
                [metadataRow.fieldName]: resolvedFieldValue,
            });
        }
    }

    return { resolvedSession, resolvedSurveillanceForm, resolvedFormAnswers };
}
