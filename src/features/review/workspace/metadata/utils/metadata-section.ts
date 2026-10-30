import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import {
    formQuestionTypeSchema,
    type FormQuestion,
    type FormQuestionScope,
    type FormQuestionType,
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
    isUnitIdentityComponent: boolean;
    isOutdated: boolean;
    questionKey: string | null;
}

export interface MetadataSection {
    key: string;
    title: string | null;
    rows: MetadataRow[];
    sessionUnitIdBySessionId?: Map<number, number>;
}

export function formatDisplayValue(
    value: unknown,
    fieldType?: FormQuestionType,
): string {
    if (value == null || value === '') return NOT_APPLICABLE;
    if (typeof value === 'boolean')
        return value ? BOOLEAN_TRUE_DISPLAY : BOOLEAN_FALSE_DISPLAY;
    if (fieldType === 'boolean' && (value === 'true' || value === 'false'))
        return value === 'true' ? BOOLEAN_TRUE_DISPLAY : BOOLEAN_FALSE_DISPLAY;
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

function buildQuestionMatchKey(
    questionKey: string,
    answerScope: FormQuestionScope,
    type: string | null,
): string {
    return JSON.stringify([questionKey, answerScope, type]);
}

export function toQuestionMatchKey(question: FormQuestion): string {
    return buildQuestionMatchKey(
        question.questionKey,
        question.answerScope,
        question.type,
    );
}

export function toAnswerMatchKey(formAnswer: FormAnswer): string {
    return buildQuestionMatchKey(
        formAnswer.questionKey ?? `questionId:${formAnswer.questionId}`,
        formAnswer.sessionUnitId === null ? 'SESSION' : 'SESSION_UNIT',
        formAnswer.type,
    );
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
    const sessionScopedQuestions = flattenQuestions(
        currentFormQuestions,
    ).filter(question => question.answerScope === 'SESSION');

    for (const question of sessionScopedQuestions) {
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

    rows.push(
        ...buildOutdatedRows(
            new Map(
                sessions.map(session => [
                    session.sessionId,
                    formAnswersBySessionId
                        .get(session.sessionId)
                        ?.filter(answer => answer.sessionUnitId === null) ?? [],
                ]),
            ),
            sessionScopedQuestions,
        ),
    );

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
        isUnitIdentityComponent?: boolean;
        isOutdated?: boolean;
        questionKey?: string | null;
    },
    fieldValueBySessionId: Map<number, unknown>,
    groupKey?: string,
): MetadataRow {
    const {
        entity,
        fieldName,
        label,
        fieldType,
        required,
        options,
        isUnitIdentityComponent,
        isOutdated,
        questionKey,
    } = field;
    const distinctDisplayValues = new Set(
        [...fieldValueBySessionId.values()].map(value =>
            formatDisplayValue(value, fieldType),
        ),
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
        hasConflict: !isOutdated && distinctDisplayValues.size > 1,
        required: required ?? false,
        options: options ?? null,
        isUnitIdentityComponent: isUnitIdentityComponent ?? false,
        isOutdated: isOutdated ?? false,
        questionKey: questionKey ?? null,
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
        isUnitIdentityComponent: question.isUnitIdentityComponent,
        questionKey: question.questionKey,
    };
}

export function buildOutdatedRows(
    formAnswersBySessionId: Map<number, FormAnswer[]>,
    currentFormQuestions: FormQuestion[],
    groupKey?: string,
): MetadataRow[] {
    const currentQuestionIds = new Set(
        currentFormQuestions.map(question => question.id),
    );
    const outdatedAnswersBySessionId = new Map(
        [...formAnswersBySessionId].map(([sessionId, formAnswers]) => [
            sessionId,
            formAnswers.filter(
                formAnswer =>
                    !currentQuestionIds.has(formAnswer.questionId) &&
                    formatDisplayValue(formAnswer.value) !== NOT_APPLICABLE,
            ),
        ]),
    );
    const firstOutdatedAnswerByMatchKey = new Map<string, FormAnswer>();
    for (const outdatedAnswers of outdatedAnswersBySessionId.values()) {
        for (const outdatedAnswer of outdatedAnswers) {
            const matchKey = toAnswerMatchKey(outdatedAnswer);
            if (!firstOutdatedAnswerByMatchKey.has(matchKey)) {
                firstOutdatedAnswerByMatchKey.set(matchKey, outdatedAnswer);
            }
        }
    }

    return [...firstOutdatedAnswerByMatchKey].map(
        ([matchKey, firstOutdatedAnswer]) => {
            const parsedFieldType = formQuestionTypeSchema.safeParse(
                firstOutdatedAnswer.type,
            );
            return buildMetadataRow(
                {
                    entity: 'formAnswer',
                    fieldName: String(firstOutdatedAnswer.questionId),
                    label: firstOutdatedAnswer.label ?? '',
                    fieldType: parsedFieldType.success
                        ? parsedFieldType.data
                        : 'text',
                    isOutdated: true,
                    questionKey: firstOutdatedAnswer.questionKey,
                },
                new Map(
                    [...outdatedAnswersBySessionId].map(
                        ([sessionId, outdatedAnswers]) => [
                            sessionId,
                            outdatedAnswers.find(
                                outdatedAnswer =>
                                    toAnswerMatchKey(outdatedAnswer) ===
                                    matchKey,
                            )?.value ?? null,
                        ],
                    ),
                ),
                groupKey,
            );
        },
    );
}
