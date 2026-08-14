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

export const SURVEILLANCE_FIELD_DEPENDENCIES: Record<
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

const SURVEILLANCE_REQUIRED_ROW_IDS = new Set(
    Object.values(SURVEILLANCE_FIELD_DEPENDENCIES).flatMap(
        dependency => dependency.dependentRowIds,
    ),
);

export interface MetadataRow {
    id: string;
    label: string;
    entity: 'session' | 'surveillanceForm' | 'formAnswer';
    fieldName: string;
    fieldType: FormQuestionType;
    fieldValueBySessionId: Map<number, unknown>;
    hasConflict: boolean;
    required: boolean;
    options: string[] | null;
}

export interface MetadataSection {
    key: string;
    title: string | null;
    rows: MetadataRow[];
    sessionUnitIdBySessionId?: Map<number, number>;
}

export function formatDisplayValue(value: unknown): string {
    if (value == null) return NOT_APPLICABLE;
    if (typeof value === 'boolean')
        return value ? BOOLEAN_TRUE_DISPLAY : BOOLEAN_FALSE_DISPLAY;
    return String(value);
}

export function flattenQuestions(questions: FormQuestion[]): FormQuestion[] {
    const flattenedQuestions: FormQuestion[] = [];
    for (const question of questions) {
        flattenedQuestions.push(question);
        if (question.subQuestions?.length) {
            flattenedQuestions.push(...flattenQuestions(question.subQuestions));
        }
    }
    return flattenedQuestions;
}

export function buildSurveillanceSection(
    sessions: Session[],
    surveillanceFormBySessionId: Map<number, SurveillanceForm | null>,
): MetadataSection {
    const rows = buildSessionCoreRows(sessions);

    const hasAnySurveillanceForm = [
        ...surveillanceFormBySessionId.values(),
    ].some(surveillanceForm => surveillanceForm !== null);
    if (hasAnySurveillanceForm) {
        for (const {
            fieldName,
            label,
            fieldType,
        } of SURVEILLANCE_FORM_FIELDS) {
            rows.push(
                buildMetadataRow(
                    {
                        entity: 'surveillanceForm',
                        fieldName,
                        label,
                        fieldType,
                        required: SURVEILLANCE_REQUIRED_ROW_IDS.has(
                            `surveillanceForm.${fieldName}`,
                        ),
                    },
                    new Map(
                        sessions.map(session => [
                            session.sessionId,
                            surveillanceFormBySessionId.get(
                                session.sessionId,
                            )?.[fieldName] ?? null,
                        ]),
                    ),
                ),
            );
        }
    }

    return { key: 'session', title: null, rows };
}

export function buildDynamicSessionSection(
    sessions: Session[],
    currentFormQuestions: FormQuestion[],
    formAnswersBySessionId: Map<number, FormAnswer[]>,
): MetadataSection {
    const rows = buildSessionCoreRows(sessions);

    for (const question of flattenQuestions(currentFormQuestions).filter(
        question => question.answerScope === 'SESSION',
    )) {
        rows.push(
            buildMetadataRow(
                questionToMetadataField(question),
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

    return { key: 'session', title: null, rows };
}

function buildSessionCoreRows(sessions: Session[]): MetadataRow[] {
    return SESSION_FIELDS.map(({ fieldName, label, fieldType }) =>
        buildMetadataRow(
            { entity: 'session', fieldName, label, fieldType },
            new Map(
                sessions.map(session => [
                    session.sessionId,
                    session[fieldName],
                ]),
            ),
        ),
    );
}

export function buildMetadataRow(
    field: {
        entity: MetadataRow['entity'];
        fieldName: string;
        label: string;
        fieldType: FormQuestionType;
        required?: boolean;
        options?: string[] | null;
    },
    fieldValueBySessionId: Map<number, unknown>,
    groupKey?: string,
): MetadataRow {
    const { entity, fieldName, label, fieldType, required, options } = field;
    const distinctDisplayValues = new Set(
        [...fieldValueBySessionId.values()].map(formatDisplayValue),
    );
    return {
        id: groupKey
            ? `${groupKey}.${entity}.${fieldName}`
            : `${entity}.${fieldName}`,
        label,
        entity,
        fieldName,
        fieldType,
        fieldValueBySessionId,
        hasConflict: distinctDisplayValues.size > 1,
        required: required ?? false,
        options: options ?? null,
    };
}

export function questionToMetadataField(
    question: FormQuestion,
): Parameters<typeof buildMetadataRow>[0] {
    return {
        entity: 'formAnswer',
        fieldName: String(question.id),
        label: question.label,
        fieldType: question.type,
        required: question.required,
        options: question.options,
    };
}
