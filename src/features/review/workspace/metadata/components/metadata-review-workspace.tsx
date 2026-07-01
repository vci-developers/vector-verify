'use client';

import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { useGetFormAnswersBySessionIds } from '@/api/form-answer/hooks/use-get-form-answers-by-session-id';
import type { FormAnswer } from '@/api/form-answer/validation/form-answer-schema';
import { useGetCurrentFormByProgramId } from '@/api/form/hooks/use-get-current-form-by-program-id';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import { sessionKeys } from '@/api/session/session-keys';
import type { Session } from '@/api/session/validation/session-schema';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import { Button } from '@/components/ui/button';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { toastResult } from '@/lib/network/toast-result';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { useQueryClient } from '@tanstack/react-query';
import { TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useMetadataReviewState } from '../hooks/use-metadata-review-state';
import { applyConflictResolutions } from '../utils/apply-conflict-resolutions';
import {
    buildDynamicMetadataRows,
    buildSurveillanceMetadataRows,
    type MetadataRow,
} from '../utils/metadata-row';
import MetadataReviewTable from './metadata-review-table';

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
        disabledRowIds,
        handleConflictResolutionChange,
        resetResolutions,
    } = useMetadataReviewState();

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

    const {
        mutate: resolveSessionConflicts,
        isPending: isResolveSessionConflictsPending,
    } = useResolveSessionConflicts();

    if (sessions.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">{t('noSessions')}</p>
        );
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
            <p className="text-destructive text-sm">
                {getCurrentFormByProgramIdResult.error.message ??
                    t('currentFormError')}
            </p>
        );
    }

    let metadataRows: MetadataRow[];
    let resolvableSessions: Session[];
    let sessionsMissingSurveillanceForm: Session[] = [];

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
                <p className="text-destructive text-sm">
                    {failedFormAnswerQuery.data.error.message ??
                        t('formAnswersError')}
                </p>
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
        metadataRows = buildDynamicMetadataRows(
            sessions,
            getCurrentFormByProgramIdResult.data.questions ?? [],
            formAnswersBySessionId,
        );
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
                <p className="text-destructive text-sm">
                    {failedSurveillanceFormQuery.data.error.message}
                </p>
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

        metadataRows = buildSurveillanceMetadataRows(
            resolvableSessions,
            surveillanceFormBySessionId,
        );
    }

    const hasConflicts = metadataRows.some(
        metadataRow => metadataRow.hasConflict,
    );
    const areAllConflictsResolved = metadataRows.every(
        metadataRow =>
            !metadataRow.hasConflict ||
            resolutionsByMetadataRowId.has(metadataRow.id),
    );

    function resolveConflictsAndContinue() {
        const { resolvedData, resolvedSurveillanceForm, resolvedFormAnswers } =
            applyConflictResolutions(metadataRows, resolutionsByMetadataRowId);

        resolveSessionConflicts(
            {
                sessionIds: resolvableSessions.map(
                    session => session.sessionId,
                ),
                resolvedData,
                ...(isDynamicFormMode
                    ? { resolvedFormAnswers }
                    : { resolvedSurveillanceForm }),
            },
            {
                onSuccess: resolveResult => {
                    toastResult(resolveResult, {
                        success: t('resolveSuccess'),
                        error: t('resolveError'),
                    });
                    if (!resolveResult.ok) return;
                    resetResolutions();
                    queryClient.invalidateQueries({
                        queryKey: sessionKeys.root,
                    });
                    for (const session of resolvableSessions) {
                        queryClient.invalidateQueries({
                            queryKey: isDynamicFormMode
                                ? formAnswerKeys.formAnswersBySessionId(
                                      session.sessionId,
                                  )
                                : surveillanceFormKeys.surveillanceFormBySessionId(
                                      session.sessionId,
                                  ),
                        });
                    }
                    onGoToNextStep();
                },
            },
        );
    }

    const showResolveAction = !readOnly && hasConflicts;

    return (
        <div className="space-y-4">
            {!readOnly && (
                <p className="text-muted-foreground text-sm">{t('intro')}</p>
            )}

            {sessionsMissingSurveillanceForm.length > 0 && (
                <p className="text-destructive flex items-start gap-2 text-sm">
                    <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" />
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
            )}

            <MetadataReviewTable
                sessions={resolvableSessions}
                timezone={timezone ?? null}
                metadataRows={metadataRows}
                resolutionsByMetadataRowId={resolutionsByMetadataRowId}
                onConflictResolutionChange={handleConflictResolutionChange}
                disabledRowIds={disabledRowIds}
                readOnly={readOnly}
            />

            <div className="flex justify-end">
                {showResolveAction ? (
                    <Button
                        onClick={resolveConflictsAndContinue}
                        disabled={
                            !areAllConflictsResolved ||
                            isResolveSessionConflictsPending
                        }
                    >
                        {isResolveSessionConflictsPending
                            ? t('resolving')
                            : t('resolveAndContinue')}
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
