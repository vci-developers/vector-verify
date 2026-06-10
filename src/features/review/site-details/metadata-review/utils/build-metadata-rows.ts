import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { GetFormAnswersBySessionIdResponseBody } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import {
    SESSION_FIELDS,
    SURVEILLANCE_FORM_FIELDS,
} from '@/features/review/site-details/metadata-review/utils/metadata-fields';
import { formatDisplayValue } from '@/features/review/site-details/metadata-review/utils/metadata-values';
import type {
    FormAnswerMetadataRow,
    MetadataRow,
    SessionMetadataRow,
    SurveillanceFormMetadataRow,
    UnitFormAnswerMetadataRow,
    UnitGroupMeta,
} from '@/features/review/site-details/metadata-review/utils/metadata-row-types';

function hasValueConflict(
    fieldValueBySessionId: Map<number, unknown>,
): boolean {
    return (
        new Set([...fieldValueBySessionId.values()].map(formatDisplayValue))
            .size > 1
    );
}

function buildSessionRows(sessions: Session[]): SessionMetadataRow[] {
    return SESSION_FIELDS.map(({ fieldName, label }) => {
        const fieldValueBySessionId = new Map(
            sessions.map(session => [session.sessionId, session[fieldName]]),
        );
        return {
            id: `session.${fieldName}`,
            label,
            entity: 'session',
            fieldName,
            fieldValueBySessionId,
            hasConflict: hasValueConflict(fieldValueBySessionId),
        };
    });
}

function buildSurveillanceFormRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
): SurveillanceFormMetadataRow[] {
    const hasAnySurveillanceForm = [
        ...surveillanceFormsBySessionId.values(),
    ].some(form => form !== null);
    if (!hasAnySurveillanceForm) return [];

    return SURVEILLANCE_FORM_FIELDS.map(({ fieldName, label }) => {
        const fieldValueBySessionId = new Map(
            sessions.map(session => [
                session.sessionId,
                surveillanceFormsBySessionId.get(session.sessionId)?.[
                    fieldName
                ] ?? null,
            ]),
        );
        return {
            id: `surveillanceForm.${fieldName}`,
            label,
            entity: 'surveillanceForm',
            fieldName,
            fieldValueBySessionId,
            hasConflict: hasValueConflict(fieldValueBySessionId),
        };
    });
}

interface SessionUnitAnswers {
    sessionId: number;
    unitOrder: number;
    identityComponents: { questionId: number; value: unknown }[];
    nonIdentityAnswers: {
        questionId: number;
        label: string;
        dataType: string;
        value: unknown;
    }[];
}

function parseFormAnswers(
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
): {
    sessionQuestions: Map<number, { label: string; dataType: string }>;
    sessionUnits: Map<number, SessionUnitAnswers>;
} {
    const sessionQuestions = new Map<
        number,
        { label: string; dataType: string }
    >();
    const sessionUnits = new Map<number, SessionUnitAnswers>();

    for (const [sessionId, formAnswers] of formAnswersBySessionId.entries()) {
        if (formAnswers === null) continue;
        for (const answer of formAnswers.answers) {
            if (answer.answerScope === 'SESSION') {
                if (!sessionQuestions.has(answer.questionId)) {
                    sessionQuestions.set(answer.questionId, {
                        label: answer.label ?? String(answer.questionId),
                        dataType: answer.dataType,
                    });
                }
            } else if (
                answer.answerScope === 'SESSION_UNIT' &&
                answer.sessionUnit !== null
            ) {
                const { id: sessionUnitId, unitOrder } = answer.sessionUnit;
                let sessionUnit = sessionUnits.get(sessionUnitId);
                if (!sessionUnit) {
                    sessionUnit = {
                        sessionId,
                        unitOrder,
                        identityComponents: [],
                        nonIdentityAnswers: [],
                    };
                    sessionUnits.set(sessionUnitId, sessionUnit);
                }
                if (answer.isUnitIdentityComponent) {
                    sessionUnit.identityComponents.push({
                        questionId: answer.questionId,
                        value: answer.value,
                    });
                } else {
                    sessionUnit.nonIdentityAnswers.push({
                        questionId: answer.questionId,
                        label: answer.label ?? String(answer.questionId),
                        dataType: answer.dataType,
                        value: answer.value,
                    });
                }
            }
        }
    }

    return { sessionQuestions, sessionUnits };
}

function buildSessionScopeFormAnswerRows(
    sessions: Session[],
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
    sessionQuestions: Map<number, { label: string; dataType: string }>,
): FormAnswerMetadataRow[] {
    return [...sessionQuestions].map(([questionId, { label, dataType }]) => {
        const fieldValueBySessionId = new Map(
            sessions.map(session => {
                const answers =
                    formAnswersBySessionId.get(session.sessionId)?.answers ??
                    [];
                return [
                    session.sessionId,
                    answers.find(answer => answer.questionId === questionId)
                        ?.value ?? null,
                ];
            }),
        );
        return {
            id: `formAnswer.${questionId}`,
            label,
            entity: 'formAnswer',
            questionId,
            dataType,
            fieldValueBySessionId,
            hasConflict: hasValueConflict(fieldValueBySessionId),
        };
    });
}

interface UnitGroupBuilder {
    label: string;
    minUnitOrder: number;
    sessionUnitIdsBySessionId: Map<number, number>;
    questionData: Map<
        number,
        {
            label: string;
            dataType: string;
            valuesBySessionId: Map<number, unknown>;
        }
    >;
}

function buildUnitGroupBuilders(
    sessionUnits: Map<number, SessionUnitAnswers>,
): Map<string, UnitGroupBuilder> {
    const unitGroupBuildersByIdentity = new Map<string, UnitGroupBuilder>();

    for (const [sessionUnitId, sessionUnit] of sessionUnits) {
        const sortedIdentityComponents = [
            ...sessionUnit.identityComponents,
        ].sort(
            (leftComponent, rightComponent) =>
                leftComponent.questionId - rightComponent.questionId,
        );
        const unitIdentity = sortedIdentityComponents
            .map(identityComponent =>
                String(identityComponent.value ?? '')
                    .trim()
                    .toLowerCase(),
            )
            .join(' / ');
        const identityLabelParts = sortedIdentityComponents
            .map(identityComponent => identityComponent.value)
            .filter(value => value != null && String(value).trim() !== '')
            .map(value => String(value).trim());

        let unitGroupBuilder = unitGroupBuildersByIdentity.get(unitIdentity);
        if (!unitGroupBuilder) {
            unitGroupBuilder = {
                label:
                    identityLabelParts.length > 0
                        ? identityLabelParts.join(' / ')
                        : `Unit ${sessionUnit.unitOrder}`,
                minUnitOrder: sessionUnit.unitOrder,
                sessionUnitIdsBySessionId: new Map(),
                questionData: new Map(),
            };
            unitGroupBuildersByIdentity.set(unitIdentity, unitGroupBuilder);
        }
        unitGroupBuilder.minUnitOrder = Math.min(
            unitGroupBuilder.minUnitOrder,
            sessionUnit.unitOrder,
        );
        unitGroupBuilder.sessionUnitIdsBySessionId.set(
            sessionUnit.sessionId,
            sessionUnitId,
        );
        for (const nonIdentityAnswer of sessionUnit.nonIdentityAnswers) {
            let questionData = unitGroupBuilder.questionData.get(
                nonIdentityAnswer.questionId,
            );
            if (!questionData) {
                questionData = {
                    label: nonIdentityAnswer.label,
                    dataType: nonIdentityAnswer.dataType,
                    valuesBySessionId: new Map(),
                };
                unitGroupBuilder.questionData.set(
                    nonIdentityAnswer.questionId,
                    questionData,
                );
            }
            questionData.valuesBySessionId.set(
                sessionUnit.sessionId,
                nonIdentityAnswer.value,
            );
        }
    }

    return unitGroupBuildersByIdentity;
}

function buildUnitGroupRows(
    sessionUnits: Map<number, SessionUnitAnswers>,
    sessions: Session[],
): {
    rows: UnitFormAnswerMetadataRow[];
    unitGroups: UnitGroupMeta[];
} {
    const unitGroupBuildersByIdentity = buildUnitGroupBuilders(sessionUnits);

    const rows: UnitFormAnswerMetadataRow[] = [];
    const unitGroups: UnitGroupMeta[] = [];

    for (const [unitIdentity, unitGroupBuilder] of [
        ...unitGroupBuildersByIdentity.entries(),
    ].sort(
        ([, leftBuilder], [, rightBuilder]) =>
            leftBuilder.minUnitOrder - rightBuilder.minUnitOrder,
    )) {
        unitGroups.push({
            unitIdentity,
            sessionUnitIdsBySessionId:
                unitGroupBuilder.sessionUnitIdsBySessionId,
        });

        for (const [
            questionId,
            { label, dataType, valuesBySessionId },
        ] of unitGroupBuilder.questionData) {
            const fieldValueBySessionId = new Map<number, unknown>(
                sessions.map(session => [
                    session.sessionId,
                    valuesBySessionId.get(session.sessionId) ?? null,
                ]),
            );
            rows.push({
                id: `unitFormAnswer.${unitIdentity}.${questionId}`,
                label,
                entity: 'unitFormAnswer',
                questionId,
                dataType,
                unitIdentity,
                unitLabel: unitGroupBuilder.label,
                fieldValueBySessionId,
                hasConflict: hasValueConflict(fieldValueBySessionId),
            });
        }
    }

    return { rows, unitGroups };
}

function buildFormAnswerRows(
    sessions: Session[],
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
): { rows: MetadataRow[]; unitGroups: UnitGroupMeta[] } {
    const { sessionQuestions, sessionUnits } = parseFormAnswers(
        formAnswersBySessionId,
    );
    const sessionScopeRows = buildSessionScopeFormAnswerRows(
        sessions,
        formAnswersBySessionId,
        sessionQuestions,
    );
    const { rows: unitRows, unitGroups } = buildUnitGroupRows(
        sessionUnits,
        sessions,
    );

    return { rows: [...sessionScopeRows, ...unitRows], unitGroups };
}

export function buildMetadataRows(
    sessions: Session[],
    surveillanceFormsBySessionId: Map<number, SurveillanceForm | null>,
    formAnswersBySessionId: Map<
        number,
        GetFormAnswersBySessionIdResponseBody | null
    >,
): { rows: MetadataRow[]; unitGroups: UnitGroupMeta[] } {
    const hasAnyFormAnswers = [...formAnswersBySessionId.values()].some(
        result => result !== null,
    );
    const { rows: formAnswerRows, unitGroups } = hasAnyFormAnswers
        ? buildFormAnswerRows(sessions, formAnswersBySessionId)
        : { rows: [], unitGroups: [] };

    return {
        rows: [
            ...buildSessionRows(sessions),
            ...buildSurveillanceFormRows(
                sessions,
                surveillanceFormsBySessionId,
            ),
            ...formAnswerRows,
        ],
        unitGroups,
    };
}
