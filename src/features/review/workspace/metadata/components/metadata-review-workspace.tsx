'use client';

import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { useGetFormAnswersBySessionIds } from '@/api/form-answer/hooks/use-get-form-answers-by-session-id';
import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import { useGetCurrentFormByProgramId } from '@/api/form/hooks/use-get-current-form-by-program-id';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import { sessionKeys } from '@/api/session/session-keys';
import type { Session } from '@/api/session/validation/session-schema';
import type { ResolveSessionConflictsRequestBody } from '@/api/session/validation/resolve-session-conflicts-schema';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { useQueryClient } from '@tanstack/react-query';
import { Pencil, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';
import { useMetadataReviewState } from '../hooks/use-metadata-review-state';
import { applyConflictResolutions } from '../utils/apply-conflict-resolutions';
import { buildUnitIdentitySections } from '../utils/group-session-units-by-identity';
import {
    buildDynamicSessionSection,
    buildSurveillanceSection,
    flattenQuestions,
    type MetadataSection,
} from '../utils/metadata-section';
import { evaluateDisabledRowIds } from '../utils/evaluate-question-answerability';
import type { FormQuestion } from '@/api/form-question/validation/form-question-schema';
import MetadataReviewTable from './metadata-review-table';
import ErrorBanner from '@/components/ui/error-banner';
import EmptyBanner from '@/components/ui/empty-banner';

interface MetadataReviewWorkspaceProps {
    sessions: Session[];
    programId: number;
    timezone?: string;
    readOnly: boolean;
    onGoToNextStep: () => void;
}

export default function MetadataReviewWorkspace({
    sessions,
    programId,
    timezone,
    readOnly,
    onGoToNextStep,
}: MetadataReviewWorkspaceProps) {
    const t = useTranslations('ReviewMetadata');
    const queryClient = useQueryClient();
    const {
        resolutionsByMetadataRowId,
        handleConflictResolutionChange,
        resetResolutions,
    } = useMetadataReviewState();
    const [isResolving, setIsResolving] = useState(false);

    const sessionIds = sessions.map(session => session.sessionId);

    const {
        data: getCurrentFormByProgramIdResult,
        isPending: isGetCurrentFormByProgramIdPending,
    } = useGetCurrentFormByProgramId(programId);

    const isDynamicFormMode = getCurrentFormByProgramIdResult?.ok === true;
    const isSurveillanceFormMode =
        getCurrentFormByProgramIdResult !== undefined &&
        !getCurrentFormByProgramIdResult.ok &&
        getCurrentFormByProgramIdResult.error.kind === 'not_found';

    const surveillanceFormQueries = useGetSurveillanceFormsBySessionIds(
        isSurveillanceFormMode ? sessionIds : [],
    );
    const formAnswerQueries = useGetFormAnswersBySessionIds(
        isDynamicFormMode ? sessionIds : [],
    );

    const { mutateAsync: resolveSessionConflictsAsync } =
        useResolveSessionConflicts();

    if (sessions.length === 0) {
        return <EmptyBanner message={t('noSessions')} />;
    }

    if (
        isGetCurrentFormByProgramIdPending ||
        !getCurrentFormByProgramIdResult
    ) {
        return <SkeletonList count={6} height="lg" width="full" />;
    }

    if (
        !getCurrentFormByProgramIdResult.ok &&
        getCurrentFormByProgramIdResult.error.kind !== 'not_found'
    ) {
        return (
            <ErrorBanner
                message={
                    getCurrentFormByProgramIdResult.error.message ||
                    t('currentFormError')
                }
            />
        );
    }

    let sections: MetadataSection[];
    let resolvableSessions: Session[];
    let sessionsMissingSurveillanceForm: Session[] = [];
    let questionsById = new Map<number, FormQuestion>();

    if (isDynamicFormMode) {
        if (formAnswerQueries.some(query => query.isPending)) {
            return <SkeletonList count={6} height="lg" width="full" />;
        }

        const failedFormAnswerQuery = formAnswerQueries.find(
            query =>
                query.data &&
                !query.data.ok &&
                query.data.error.kind !== 'not_found',
        );
        if (failedFormAnswerQuery?.data && !failedFormAnswerQuery.data.ok) {
            return (
                <ErrorBanner
                    message={
                        failedFormAnswerQuery.data.error.message ||
                        t('formAnswersError')
                    }
                />
            );
        }

        const formAnswersBySessionId = new Map<number, FormAnswer[]>(
            sessions.map((session, index) => {
                const formAnswersResult = formAnswerQueries[index]?.data;
                return [
                    session.sessionId,
                    formAnswersResult?.ok ? formAnswersResult.data.answers : [],
                ];
            }),
        );

        resolvableSessions = sessions;
        const currentFormQuestions =
            getCurrentFormByProgramIdResult.data.questions ?? [];
        questionsById = new Map(
            flattenQuestions(currentFormQuestions).map(question => [
                question.id,
                question,
            ]),
        );
        sections = [
            buildDynamicSessionSection(
                resolvableSessions,
                currentFormQuestions,
                formAnswersBySessionId,
            ),
            ...buildUnitIdentitySections(
                resolvableSessions,
                currentFormQuestions,
                formAnswersBySessionId,
            ),
        ];
    } else {
        if (surveillanceFormQueries.some(query => query.isPending)) {
            return <SkeletonList count={6} height="lg" width="full" />;
        }

        const failedSurveillanceFormQuery = surveillanceFormQueries.find(
            query =>
                query.data &&
                !query.data.ok &&
                query.data.error.kind !== 'not_found',
        );
        if (
            failedSurveillanceFormQuery?.data &&
            !failedSurveillanceFormQuery.data.ok
        ) {
            return (
                <ErrorBanner
                    message={
                        failedSurveillanceFormQuery.data.error.message ||
                        t('surveillanceFormError')
                    }
                />
            );
        }

        const surveillanceFormBySessionId = new Map<
            number,
            SurveillanceForm | null
        >(
            sessions.map((session, index) => {
                const surveillanceFormResult =
                    surveillanceFormQueries[index]?.data;
                return [
                    session.sessionId,
                    surveillanceFormResult?.ok
                        ? surveillanceFormResult.data
                        : null,
                ];
            }),
        );

        const hasAnySurveillanceForm = [
            ...surveillanceFormBySessionId.values(),
        ].some(surveillanceForm => surveillanceForm !== null);

        resolvableSessions = hasAnySurveillanceForm
            ? sessions.filter(
                  session =>
                      surveillanceFormBySessionId.get(session.sessionId) !=
                      null,
              )
            : sessions;
        sessionsMissingSurveillanceForm = hasAnySurveillanceForm
            ? sessions.filter(
                  session =>
                      surveillanceFormBySessionId.get(session.sessionId) ==
                      null,
              )
            : [];

        sections = [
            buildSurveillanceSection(
                resolvableSessions,
                surveillanceFormBySessionId,
            ),
        ];
    }

    const disabledRowIds = evaluateDisabledRowIds(
        sections,
        resolutionsByMetadataRowId,
        questionsById,
    );

    const areAllConflictsResolved = sections.every(section =>
        section.rows.every(
            row =>
                !row.hasConflict ||
                resolutionsByMetadataRowId.has(row.id) ||
                disabledRowIds.has(row.id),
        ),
    );

    const unresolvedConflictCount = sections.reduce(
        (count, section) =>
            count +
            section.rows.filter(
                row =>
                    row.hasConflict &&
                    !resolutionsByMetadataRowId.has(row.id) &&
                    !disabledRowIds.has(row.id),
            ).length,
        0,
    );

    async function resolveConflictsAndContinue() {
        const resolvableSessionIds = resolvableSessions.map(
            session => session.sessionId,
        );
        const sectionsToResolve = sections.filter(section =>
            section.rows.some(row => resolutionsByMetadataRowId.has(row.id)),
        );

        if (sectionsToResolve.length === 0) {
            onGoToNextStep();
            return;
        }

        setIsResolving(true);
        const outcomes = await Promise.allSettled(
            sectionsToResolve.map(section => {
                const {
                    resolvedData,
                    resolvedSurveillanceForm,
                    resolvedFormAnswers,
                } = applyConflictResolutions(
                    section.rows,
                    resolutionsByMetadataRowId,
                    disabledRowIds,
                );
                const requestBody: ResolveSessionConflictsRequestBody =
                    section.sessionUnitIdBySessionId
                        ? {
                              sessionUnitIds: [
                                  ...section.sessionUnitIdBySessionId.values(),
                              ],
                              resolvedFormAnswers,
                          }
                        : {
                              sessionIds: resolvableSessionIds,
                              resolvedData,
                              ...(Object.keys(resolvedSurveillanceForm).length >
                                  0 && { resolvedSurveillanceForm }),
                              ...(resolvedFormAnswers.length > 0 && {
                                  resolvedFormAnswers,
                              }),
                          };
                return resolveSessionConflictsAsync(requestBody);
            }),
        );
        setIsResolving(false);

        const allResolved = outcomes.every(
            outcome => outcome.status === 'fulfilled' && outcome.value.ok,
        );
        if (!allResolved) {
            toast.error(t('resolveError'));
            return;
        }

        toast.success(t('resolveSuccess'));
        resetResolutions();
        queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        for (const session of resolvableSessions) {
            queryClient.invalidateQueries({
                queryKey: isDynamicFormMode
                    ? formAnswerKeys.formAnswersBySessionId(session.sessionId)
                    : surveillanceFormKeys.surveillanceFormBySessionId(
                          session.sessionId,
                      ),
            });
        }
        onGoToNextStep();
    }

    return (
        <div className="space-y-4">
            {!readOnly && (
                <div className="text-muted-foreground space-y-2 text-sm">
                    <p>{t('intro')}</p>
                    <div className="flex flex-col gap-y-2">
                        <span className="flex items-center gap-1.5">
                            <Pencil className="h-3.5 w-3.5 shrink-0" />
                            {t('legendEdit')}
                        </span>
                        {unresolvedConflictCount > 0 && (
                            <span className="text-destructive flex items-center gap-1.5">
                                <TriangleAlert className="h-3.5 w-3.5 shrink-0" />
                                {t('legendConflict')}
                            </span>
                        )}
                    </div>
                </div>
            )}

            {sessionsMissingSurveillanceForm.length > 0 && (
                <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <TriangleAlert className="text-warning h-5 w-5 shrink-0" />
                        <p className="text-sm">
                            {t('missingSurveillanceFormNotice', {
                                count: sessionsMissingSurveillanceForm.length,
                                dates: sessionsMissingSurveillanceForm
                                    .map(session =>
                                        formatDateInTimezone(
                                            session.collectionDate,
                                            timezone ?? null,
                                            'MMM d, yyyy',
                                        ),
                                    )
                                    .join(', '),
                            })}
                        </p>
                    </div>
                </div>
            )}

            <MetadataReviewTable
                sessions={resolvableSessions}
                timezone={timezone ?? null}
                sections={sections}
                resolutionsByMetadataRowId={resolutionsByMetadataRowId}
                onConflictResolutionChange={handleConflictResolutionChange}
                disabledRowIds={disabledRowIds}
                readOnly={readOnly}
            />

            <div className="flex items-center justify-end gap-3">
                {!readOnly && unresolvedConflictCount > 0 && (
                    <p className="text-destructive flex items-center gap-1.5 text-sm">
                        <TriangleAlert className="h-4 w-4 shrink-0" />
                        {t('conflictsRemaining', {
                            count: unresolvedConflictCount,
                        })}
                    </p>
                )}
                {!readOnly ? (
                    <Button
                        onClick={() => void resolveConflictsAndContinue()}
                        disabled={!areAllConflictsResolved || isResolving}
                    >
                        {isResolving ? t('saving') : t('saveAndContinue')}
                    </Button>
                ) : (
                    <Button onClick={onGoToNextStep}>
                        {t('continueToImageReview')}
                    </Button>
                )}
            </div>
        </div>
    );
}
