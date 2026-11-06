import type { GetFormAnswersBySessionIdSuccessPayload } from '@/api/form-answer/validation/get-form-answers-by-session-id-schema';
import type { Form } from '@/api/form/validation/form-schema';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { buildDynamicFormMetadata } from './build-dynamic-form-metadata';
import { buildSurveillanceSection } from './metadata-section';

export function buildMetadataReviewSections(
    sessions: Session[],
    formData:
        | {
              mode: 'dynamic';
              currentForm: Form;
              formAnswersResponseBySessionId: Map<
                  number,
                  GetFormAnswersBySessionIdSuccessPayload | null
              >;
          }
        | {
              mode: 'surveillance';
              surveillanceFormBySessionId: Map<number, SurveillanceForm | null>;
          },
) {
    if (formData.mode === 'dynamic') {
        return {
            ...buildDynamicFormMetadata(
                sessions,
                formData.formAnswersResponseBySessionId,
                formData.currentForm,
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
        currentFormSessionIds: new Set<number>(),
        resolvableSessions,
        sessionsMissingSurveillanceForm,
    };
}
