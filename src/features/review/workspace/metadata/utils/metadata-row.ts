import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type {
    FormQuestion,
    FormQuestionType,
} from '@/api/form-question/validation/form-question-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';

export const NOT_APPLICABLE = 'N/A';
export const BOOLEAN_TRUE_DISPLAY = 'Yes';
export const BOOLEAN_FALSE_DISPLAY = 'No';

const SESSION_FIELDS = [
    { fieldName: 'collectorName', label: 'Collector Name', fieldType: 'text' },
    {
        fieldName: 'collectorTitle',
        label: 'Collector Title',
        fieldType: 'text',
    },
    {
        fieldName: 'collectionMethod',
        label: 'Collection Method',
        fieldType: 'text',
    },
] as const satisfies readonly {
    fieldName: keyof Session;
    label: string;
    fieldType: FormQuestionType;
}[];

const SURVEILLANCE_FORM_FIELDS = [
    {
        fieldName: 'numPeopleSleptInHouse',
        label: 'People in House',
        fieldType: 'number',
    },
    {
        fieldName: 'wasIrsConducted',
        label: 'Was IRS Conducted',
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
    { fieldName: 'llinType', label: 'LLIN Type', fieldType: 'text' },
    { fieldName: 'llinBrand', label: 'LLIN Brand', fieldType: 'text' },
    {
        fieldName: 'numPeopleSleptUnderLlin',
        label: 'People Under LLIN',
        fieldType: 'number',
    },
] as const satisfies readonly {
    fieldName: keyof SurveillanceForm;
    label: string;
    fieldType: FormQuestionType;
}[];

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm' | 'formAnswer';
    fieldName: string;
    // For formAnswer rows this is the dynamic question's own `type`, echoed back
    // as the answer `dataType` on resolve.
    fieldType: FormQuestionType;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
}

export function formatDisplayValue(value: unknown): string {
    if (value == null) return NOT_APPLICABLE;
    if (typeof value === 'boolean')
        return value ? BOOLEAN_TRUE_DISPLAY : BOOLEAN_FALSE_DISPLAY;
    return String(value);
}

function buildSessionCoreRows(sessions: Session[]): MetadataRow[] {
    return SESSION_FIELDS.map(({ fieldName, label, fieldType }) =>
        buildMetadataRow(
            'session',
            fieldName,
            label,
            fieldType,
            new Map(
                sessions.map(session => [
                    session.sessionId,
                    session[fieldName],
                ]),
            ),
        ),
    );
}

export function buildSurveillanceMetadataRows(
    sessions: Session[],
    surveillanceFormBySessionId: Map<number, SurveillanceForm | null>,
): MetadataRow[] {
    const metadataRows = buildSessionCoreRows(sessions);

    const hasAnySurveillanceForm = [
        ...surveillanceFormBySessionId.values(),
    ].some(surveillanceForm => surveillanceForm !== null);
    if (!hasAnySurveillanceForm) return metadataRows;

    for (const { fieldName, label, fieldType } of SURVEILLANCE_FORM_FIELDS) {
        metadataRows.push(
            buildMetadataRow(
                'surveillanceForm',
                fieldName,
                label,
                fieldType,
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        surveillanceFormBySessionId.get(session.sessionId)?.[
                            fieldName
                        ] ?? null,
                    ]),
                ),
            ),
        );
    }

    return metadataRows;
}

export function buildDynamicMetadataRows(
    sessions: Session[],
    currentFormQuestions: FormQuestion[],
    formAnswersBySessionId: Map<number, FormAnswer[]>,
): MetadataRow[] {
    const metadataRows = buildSessionCoreRows(sessions);

    for (const question of flattenSessionScopedQuestions(
        currentFormQuestions,
    )) {
        metadataRows.push(
            buildMetadataRow(
                'formAnswer',
                String(question.id),
                question.label,
                question.type,
                new Map(
                    sessions.map(session => [
                        session.sessionId,
                        formAnswersBySessionId
                            .get(session.sessionId)
                            ?.find(answer => answer.questionId === question.id)
                            ?.value ?? null,
                    ]),
                ),
            ),
        );
    }

    return metadataRows;
}

function flattenSessionScopedQuestions(
    questions: FormQuestion[],
): FormQuestion[] {
    const sessionScopedQuestions: FormQuestion[] = [];
    for (const question of questions) {
        if (question.answerScope === 'SESSION') {
            sessionScopedQuestions.push(question);
        }
        if (question.subQuestions?.length) {
            sessionScopedQuestions.push(
                ...flattenSessionScopedQuestions(question.subQuestions),
            );
        }
    }
    return sessionScopedQuestions;
}

function buildMetadataRow(
    entity: MetadataRow['entity'],
    fieldName: string,
    label: string,
    fieldType: FormQuestionType,
    fieldValueBySessionId: Map<number, unknown>,
): MetadataRow {
    const distinctDisplayValues = new Set(
        [...fieldValueBySessionId.values()].map(formatDisplayValue),
    );
    return {
        id: `${entity}.${fieldName}`,
        label,
        entity,
        fieldName,
        fieldType,
        fieldValueBySessionId,
        hasConflict: distinctDisplayValues.size > 1,
    };
}
