import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import type { Session } from '@/api/session/validation/session-schema';
import {
    buildMetadataRow,
    flattenQuestions,
    formatDisplayValue,
    questionToMetadataField,
    type MetadataSection,
} from './metadata-section';

export function buildUnitIdentitySections(
    sessions: Session[],
    currentFormQuestions: FormQuestion[],
    formAnswersBySessionId: Map<number, FormAnswer[]>,
): MetadataSection[] {
    const unitScopedQuestions = flattenQuestions(currentFormQuestions).filter(
        question => question.answerScope === 'SESSION_UNIT',
    );
    const identityQuestions = unitScopedQuestions.filter(
        question => question.isUnitIdentityComponent,
    );
    const nonIdentityQuestions = unitScopedQuestions.filter(
        question => !question.isUnitIdentityComponent,
    );
    if (nonIdentityQuestions.length === 0) return [];

    const groupsByKey = new Map<
        string,
        {
            title: string;
            units: {
                sessionId: number;
                sessionUnitId: number;
                valueByQuestionId: Map<number, unknown>;
            }[];
        }
    >();

    for (const session of sessions) {
        const answers = formAnswersBySessionId.get(session.sessionId) ?? [];

        for (const [sessionUnitId, unitAnswers] of groupAnswersByUnitId(
            answers,
        )) {
            const valueByQuestionId = new Map<number, unknown>(
                unitAnswers.map(answer => [answer.questionId, answer.value]),
            );
            const identityValues = identityQuestions.map(question =>
                formatDisplayValue(
                    valueByQuestionId.get(question.id) ?? null,
                    question.type,
                ),
            );
            const key =
                identityQuestions.length > 0
                    ? JSON.stringify([
                          ...identityQuestions.map(question => question.id),
                          ...identityValues,
                      ])
                    : `unit:${session.sessionId}:${sessionUnitId}`;

            let group = groupsByKey.get(key);
            if (!group) {
                group = {
                    title:
                        identityValues.length > 0
                            ? identityValues.join(' · ')
                            : `Unit ${sessionUnitId}`,
                    units: [],
                };
                groupsByKey.set(key, group);
            }
            group.units.push({
                sessionId: session.sessionId,
                sessionUnitId,
                valueByQuestionId,
            });
        }
    }

    return [...groupsByKey.entries()].map(([key, group]) => ({
        key,
        title: group.title,
        sessionUnitIdBySessionId: new Map(
            group.units.map(unit => [unit.sessionId, unit.sessionUnitId]),
        ),
        rows: nonIdentityQuestions.map(question =>
            buildMetadataRow(
                questionToMetadataField(question),
                new Map(
                    group.units.map(unit => [
                        unit.sessionId,
                        unit.valueByQuestionId.get(question.id) ?? null,
                    ]),
                ),
                key,
            ),
        ),
    }));
}

function groupAnswersByUnitId(
    answers: FormAnswer[],
): Map<number, FormAnswer[]> {
    const answersByUnitId = new Map<number, FormAnswer[]>();
    for (const answer of answers) {
        if (answer.sessionUnitId == null) continue;
        const unitAnswers = answersByUnitId.get(answer.sessionUnitId) ?? [];
        unitAnswers.push(answer);
        answersByUnitId.set(answer.sessionUnitId, unitAnswers);
    }
    return answersByUnitId;
}
