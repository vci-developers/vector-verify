'use client';

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
import { buildMetadataRows } from '../utils/metadata-row';
import MetadataReviewTable from './metadata-review-table';

interface MetadataReviewWorkspaceProps {
    sessions: Session[];
    timezone?: string;
    readOnly: boolean;
    onGoToNextStep: () => void;
}

export default function MetadataReviewWorkspace({
    sessions,
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

    const surveillanceFormQueries = useGetSurveillanceFormsBySessionIds(
        sessions.map(session => session.sessionId),
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
            const surveillanceFormResult = surveillanceFormQueries[index]?.data;
            return [
                session.sessionId,
                surveillanceFormResult?.ok ? surveillanceFormResult.data : null,
            ];
        }),
    );

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

    const metadataRows = buildMetadataRows(
        resolvableSessions,
        surveillanceFormBySessionId,
    );
    const hasConflicts = metadataRows.some(
        metadataRow => metadataRow.hasConflict,
    );
    const areAllConflictsResolved = metadataRows.every(
        metadataRow =>
            !metadataRow.hasConflict ||
            resolutionsByMetadataRowId.has(metadataRow.id),
    );

    function resolveConflictsAndContinue() {
        const { resolvedData, resolvedSurveillanceForm } =
            applyConflictResolutions(metadataRows, resolutionsByMetadataRowId);

        resolveSessionConflicts(
            {
                sessionIds: resolvableSessions.map(session => session.sessionId),
                resolvedData,
                resolvedSurveillanceForm,
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
                            queryKey:
                                surveillanceFormKeys.surveillanceFormBySessionId(
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
