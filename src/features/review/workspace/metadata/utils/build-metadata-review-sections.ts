import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { buildUnitIdentitySections } from './group-session-units-by-identity';
import {
    buildDynamicSessionSection,
    buildSurveillanceSection,
    flattenQuestions,
} from './metadata-section';

export function buildMetadataReviewSections(
    sessions: Session[],
    formData:
        | {
              mode: 'dynamic';
              questions: FormQuestion[];
              formAnswersBySessionId: Map<number, FormAnswer[]>;
          }
        | {
              mode: 'surveillance';
              surveillanceFormBySessionId: Map<number, SurveillanceForm | null>;
          },
) {
    if (formData.mode === 'dynamic') {
        const { questions, formAnswersBySessionId } = formData;
        return {
            sections: [
                buildDynamicSessionSection(
                    sessions,
                    questions,
                    formAnswersBySessionId,
                ),
                ...buildUnitIdentitySections(
                    sessions,
                    questions,
                    formAnswersBySessionId,
                ),
            ],
            questionsById: new Map(
                flattenQuestions(questions).map(question => [
                    question.id,
                    question,
                ]),
            ),
            resolvableSessions: sessions,
            sessionsMissingSurveillanceForm: [],
        };
    }

    const { surveillanceFormBySessionId } = formData;
    const hasAnySurveillanceForm = [
        ...surveillanceFormBySessionId.values(),
    ].some(surveillanceForm => surveillanceForm !== null);
    const resolvableSessions = hasAnySurveillanceForm
        ? sessions.filter(
              session =>
                  surveillanceFormBySessionId.get(session.sessionId) != null,
          )
        : sessions;
    const sessionsMissingSurveillanceForm = hasAnySurveillanceForm
        ? sessions.filter(
              session =>
                  surveillanceFormBySessionId.get(session.sessionId) == null,
          )
        : [];

    return {
        sections: [
            buildSurveillanceSection(
                resolvableSessions,
                surveillanceFormBySessionId,
            ),
        ],
        questionsById: new Map<number, FormQuestion>(),
        resolvableSessions,
        sessionsMissingSurveillanceForm,
    };
}
