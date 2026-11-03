import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { GetFormAnswersBySessionIdSuccessPayload } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import type { Form } from '@/api/form/validation/form-schema';
import type { Session } from '@/api/session/validation/session-schema';
import { buildUnitIdentitySections } from './group-session-units-by-identity';
import {
    buildDynamicSessionSection,
    flattenQuestions,
    toAnswerMatchKey,
    toQuestionMatchKey,
} from './metadata-section';

export function buildDynamicFormMetadata(
    sessions: Session[],
    formAnswersResponseBySessionId: Map<
        number,
        GetFormAnswersBySessionIdSuccessPayload | null
    >,
    currentForm: Form,
) {
    const currentFormQuestions = currentForm.questions ?? [];
    const flattenedCurrentFormQuestions =
        flattenQuestions(currentFormQuestions);

    const questionsById = new Map(
        flattenedCurrentFormQuestions.map(question => [question.id, question]),
    );
    const questionIdByMatchKey = new Map(
        flattenedCurrentFormQuestions.map(question => [
            toQuestionMatchKey(question),
            question.id,
        ]),
    );

    const formAnswersBySessionId = new Map<number, FormAnswer[]>(
        sessions.map(session => [
            session.sessionId,
            formAnswersResponseBySessionId
                .get(session.sessionId)
                ?.answers.map(formAnswer => {
                    const questionId = questionIdByMatchKey.get(
                        toAnswerMatchKey(formAnswer),
                    );
                    return questionId === undefined
                        ? formAnswer
                        : { ...formAnswer, questionId };
                }) ?? [],
        ]),
    );

    const currentFormSessionIds = new Set(
        sessions
            .filter(
                session =>
                    formAnswersResponseBySessionId.get(session.sessionId)
                        ?.formVersion === currentForm.version,
            )
            .map(session => session.sessionId),
    );

    return {
        sections: [
            buildDynamicSessionSection(
                sessions,
                currentFormQuestions,
                formAnswersBySessionId,
            ),
            ...buildUnitIdentitySections(
                sessions,
                currentFormQuestions,
                formAnswersBySessionId,
            ),
        ],
        questionsById,
        currentFormSessionIds,
    };
}
