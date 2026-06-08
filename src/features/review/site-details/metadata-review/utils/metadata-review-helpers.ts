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

export interface UnitFormAnswerMetadataRow extends BaseMetadataRow {
    entity: 'unitFormAnswer';
    questionId: number;
    dataType: string;
    unitOrder: number;
}

export interface UnitGroupMeta {
    unitOrder: number;
    label: string;
    sessionUnitIdsBySessionId: Map<number, number>;
}

export type MetadataRow =
    | SessionMetadataRow
    | SurveillanceFormMetadataRow
    | FormAnswerMetadataRow
    | UnitFormAnswerMetadataRow;

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

function buildFormAnswerValuesBySessionId(
    sessions: Session[],
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
    matchAnswer: (
        answer: GetFormAnswersBySessionIdResponseBody['answers'][number],
    ) => boolean,
): Map<number, unknown> {
    return new Map(
        sessions.map(session => {
            const answers =
                formAnswersBySessionId.get(session.sessionId)?.answers ?? [];
            return [
                session.sessionId,
                answers.find(matchAnswer)?.value ?? null,
            ];
        }),
    );
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
): { rows: MetadataRow[]; unitGroups: UnitGroupMeta[] } {
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

    const unitGroups: UnitGroupMeta[] = [];

    if (hasAnyFormAnswers) {
        const sessionQuestionMap = new Map<
            number,
            { label: string; dataType: string }
        >();
        const unitGroupBuilders = new Map<
            number,
            {
                sessionUnitIdsBySessionId: Map<number, number>;
                questionMap: Map<number, { label: string; dataType: string }>;
                identityLabel: string | null;
            }
        >();

        for (const [
            sessionId,
            formAnswers,
        ] of formAnswersBySessionId.entries()) {
            if (formAnswers === null) continue;
            for (const answer of formAnswers.answers) {
                if (answer.answerScope === 'SESSION') {
                    if (!sessionQuestionMap.has(answer.questionId)) {
                        sessionQuestionMap.set(answer.questionId, {
                            label: answer.label ?? String(answer.questionId),
                            dataType: answer.dataType,
                        });
                    }
                } else if (
                    answer.answerScope === 'SESSION_UNIT' &&
                    answer.sessionUnit !== null
                ) {
                    const { id: sessionUnitId, unitOrder } = answer.sessionUnit;
                    if (!unitGroupBuilders.has(unitOrder)) {
                        unitGroupBuilders.set(unitOrder, {
                            sessionUnitIdsBySessionId: new Map(),
                            questionMap: new Map(),
                            identityLabel: null,
                        });
                    }
                    const builder = unitGroupBuilders.get(unitOrder)!;
                    builder.sessionUnitIdsBySessionId.set(
                        sessionId,
                        sessionUnitId,
                    );
                    if (!builder.questionMap.has(answer.questionId)) {
                        builder.questionMap.set(answer.questionId, {
                            label: answer.label ?? String(answer.questionId),
                            dataType: answer.dataType,
                        });
                    }
                    if (
                        answer.isUnitIdentityComponent &&
                        builder.identityLabel === null &&
                        answer.value != null
                    ) {
                        builder.identityLabel = String(answer.value);
                    }
                }
            }
        }

        for (const [questionId, { label, dataType }] of sessionQuestionMap) {
            const fieldValueBySessionId = buildFormAnswerValuesBySessionId(
                sessions,
                formAnswersBySessionId,
                answer => answer.questionId === questionId,
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

        for (const [
            unitOrder,
            { sessionUnitIdsBySessionId, questionMap, identityLabel },
        ] of [...unitGroupBuilders.entries()].sort(([a], [b]) => a - b)) {
            const label = identityLabel ?? `Unit ${unitOrder}`;
            unitGroups.push({ unitOrder, label, sessionUnitIdsBySessionId });

            for (const [
                questionId,
                { label: questionLabel, dataType },
            ] of questionMap) {
                const fieldValueBySessionId = buildFormAnswerValuesBySessionId(
                    sessions,
                    formAnswersBySessionId,
                    answer =>
                        answer.questionId === questionId &&
                        answer.sessionUnit?.unitOrder === unitOrder,
                );
                const hasConflict = hasValueConflict(fieldValueBySessionId);
                metadataRows.push({
                    id: `unitFormAnswer.${unitOrder}.${questionId}`,
                    label: questionLabel,
                    entity: 'unitFormAnswer',
                    questionId,
                    dataType,
                    unitOrder,
                    fieldValueBySessionId,
                    hasConflict,
                });
            }
        }
    }

    return { rows: metadataRows, unitGroups };
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
    const unitFormAnswersByUnitOrder = new Map<number, ResolvedFormAnswer[]>();

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
                    unitFormAnswersByUnitOrder.get(metadataRow.unitOrder) ?? [];
                existing.push(resolvedFormAnswer);
                unitFormAnswersByUnitOrder.set(metadataRow.unitOrder, existing);
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
            Object.assign(resolvedSession, {
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
        unitFormAnswersByUnitOrder,
    };
}
