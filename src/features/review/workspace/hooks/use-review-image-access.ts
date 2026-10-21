'use client';

import { useGetCurrentFormByProgramId } from '@/api/form/hooks/use-get-current-form-by-program-id';
import { useGetFormAnswersBySessionIds } from '@/api/form-answer/hooks/use-get-form-answers-by-session-id';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import type { Session } from '@/api/session/validation/session-schema';
import {
    buildDynamicSessionSection,
    buildSurveillanceSection,
    flattenQuestions,
} from '../metadata/utils/metadata-section';
import { buildUnitIdentitySections } from '../metadata/utils/group-session-units-by-identity';
import { getMetadataReviewBlockers } from '../metadata/utils/get-metadata-review-blockers';
import { accumulateSessionSummary } from '@/features/review/utils/accumulate-session-summary';
import {
    emptySessionSummary,
    isSiteFullyReviewed,
} from '@/features/review/utils/review-site-session-summary';

export function useReviewImageAccess(sessions: Session[], programId: number) {
    const readOnly = isSiteFullyReviewed(
        sessions.reduce(accumulateSessionSummary, emptySessionSummary()),
    );
    const {
        data: form,
        isPending,
        isError,
    } = useGetCurrentFormByProgramId(programId, {
        enabled: programId > 0 && sessions.length > 0 && !readOnly,
    });
    const isDynamic = form?.ok === true;
    const isLegacy = form && !form.ok && form.error.kind === 'not_found';
    const sessionIds = readOnly
        ? []
        : sessions.map(session => session.sessionId);
    const answers = useGetFormAnswersBySessionIds(isDynamic ? sessionIds : []);
    const surveys = useGetSurveillanceFormsBySessionIds(
        isLegacy ? sessionIds : [],
    );
    const queries = isDynamic ? answers : surveys;
    if (sessions.length === 0) return 'blocked';
    if (programId <= 0) return 'loading';
    if (readOnly) return 'allowed';
    if (isPending || queries.some(query => query.isPending)) return 'loading';
    if (
        isError ||
        !form ||
        (!isDynamic && !isLegacy) ||
        queries.some(
            query =>
                query.isError ||
                !query.data ||
                (!query.data.ok && query.data.error.kind !== 'not_found'),
        )
    )
        return 'error';
    const questions = form.ok ? (form.data.questions ?? []) : [];
    const answersBySessionId = new Map(
        sessions.map((session, index) => {
            const result = answers[index]?.data;
            return [session.sessionId, result?.ok ? result.data.answers : []];
        }),
    );
    const surveysBySessionId = new Map(
        sessions.map((session, index) => {
            const result = surveys[index]?.data;
            return [session.sessionId, result?.ok ? result.data : null];
        }),
    );
    const hasAnySurvey = [...surveysBySessionId.values()].some(Boolean);
    const sections = isDynamic
        ? [
              buildDynamicSessionSection(
                  sessions,
                  questions,
                  answersBySessionId,
              ),
              ...buildUnitIdentitySections(
                  sessions,
                  questions,
                  answersBySessionId,
              ),
          ]
        : [
              buildSurveillanceSection(
                  hasAnySurvey
                      ? sessions.filter(
                            session =>
                                surveysBySessionId.get(session.sessionId) !=
                                null,
                        )
                      : sessions,
                  surveysBySessionId,
              ),
          ];
    const resolutions = new Map<string, string>();
    const { areAllConflictsResolved } = getMetadataReviewBlockers(
        sections,
        resolutions,
        new Map(
            flattenQuestions(questions).map(question => [
                question.id,
                question,
            ]),
        ),
    );
    return areAllConflictsResolved ? 'allowed' : 'blocked';
}
