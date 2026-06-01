'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import {
    applyConflictResolutions,
    buildMetadataRows,
} from '@/features/review/site-details/metadata-review/utils/metadata-review-helpers';
import { Button } from '@/components/ui/button';
import { ErrorState } from '@/components/ui/error-state';
import { Skeleton } from '@/components/ui/skeleton';
import MetadataReviewTable from './metadata-review-table';
import { useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { useMetadataReviewState } from '@/features/review/site-details/metadata-review/utils/use-metadata-review-state';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';

interface MetadataReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    onGoToNextStep: () => void;
}

export default function MetadataReviewWorkspace({
    siteId,
    startDate,
    endDate,
    onGoToNextStep,
}: MetadataReviewWorkspaceProps) {
    const t = useTranslations('Common');

    const {
        resolutionsByMetadataRowId,
        handleConflictResolutionChange,
        disabledRowIds,
        resetResolutions,
    } = useMetadataReviewState();

    const queryClient = useQueryClient();

    const {
        data: getAllSessionsResult,
        isPending: isGetAllSessionsPending,
        refetch: refetchSessions,
    } = useGetAllSessions({ siteId, startDate, endDate, type: 'SURVEILLANCE' });
    const allSessionsForSite = getAllSessionsResult?.ok
        ? getAllSessionsResult.data.sessions
        : [];

    const allSurveillanceFormQueriesForSite =
        useGetSurveillanceFormsBySessionIds(
            allSessionsForSite.map(session => session.sessionId),
        );

    const {
        mutate: resolveSessionConflicts,
        isPending: isResolveSessionConflictsPending,
    } = useResolveSessionConflicts();

    if (isGetAllSessionsPending || !getAllSessionsResult) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    if (!getAllSessionsResult.ok) {
        return (
            <ErrorState onRetry={refetchSessions} cardClassName="h-40 w-full" />
        );
    }

    if (allSessionsForSite.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No sessions found for this site.
            </p>
        );
    }

    if (allSurveillanceFormQueriesForSite.some(query => query.isPending)) {
        return (
            <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
            </div>
        );
    }

    const failedQuery = allSurveillanceFormQueriesForSite.find(
        query =>
            query.data &&
            !query.data.ok &&
            query.data.error.kind !== 'not_found',
    );
    if (failedQuery) {
        return (
            <ErrorState
                onRetry={failedQuery.refetch}
                cardClassName="h-40 w-full"
            />
        );
    }

    const surveillanceFormsBySessionId = new Map(
        allSessionsForSite.map((session, index) => [
            session.sessionId,
            allSurveillanceFormQueriesForSite[index]?.data?.ok
                ? allSurveillanceFormQueriesForSite[index].data.data
                : null,
        ]),
    );

    const hasAnySurveillanceForm = [
        ...surveillanceFormsBySessionId.values(),
    ].some(form => form !== null);

    const sessionIdsWithoutSurveillanceForm = new Set<number>(
        hasAnySurveillanceForm
            ? allSessionsForSite
                  .filter(
                      session =>
                          surveillanceFormsBySessionId.get(
                              session.sessionId,
                          ) === null,
                  )
                  .map(session => session.sessionId)
            : [],
    );

    const metadataRows = buildMetadataRows(
        allSessionsForSite,
        surveillanceFormsBySessionId,
    );

    const hasConflicts = metadataRows.some(row => row.hasConflict);
    const allConflictsResolved = metadataRows.every(
        row => !row.hasConflict || resolutionsByMetadataRowId.has(row.id),
    );

    function handleResolveConflicts() {
        const { resolvedSession, resolvedSurveillanceForm } =
            applyConflictResolutions(metadataRows, resolutionsByMetadataRowId);

        resolveSessionConflicts(
            {
                sessionIds: allSessionsForSite.map(
                    session => session.sessionId,
                ),
                resolvedData: resolvedSession,
                resolvedSurveillanceForm,
            },
            {
                onSuccess: result => {
                    if (result.ok) {
                        resetResolutions();
                        queryClient.invalidateQueries({
                            queryKey: sessionKeys.allSessions({
                                siteId,
                                startDate,
                                endDate,
                                type: 'SURVEILLANCE',
                            }),
                        });
                        for (const session of allSessionsForSite) {
                            queryClient.invalidateQueries({
                                queryKey:
                                    surveillanceFormKeys.surveillanceFormBySessionId(
                                        session.sessionId,
                                    ),
                            });
                        }
                        onGoToNextStep();
                    } else {
                        toast.error(t('error'));
                    }
                },
                onError: () => toast.error(t('error')),
            },
        );
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Review and resolve any conflicting values across sessions.
                Sessions must agree before continuing.
            </p>

            <MetadataReviewTable
                sessions={allSessionsForSite}
                metadataRows={metadataRows}
                sessionIdsWithoutSurveillanceForm={
                    sessionIdsWithoutSurveillanceForm
                }
                resolutionsByMetadataRowId={resolutionsByMetadataRowId}
                onConflictResolutionChange={handleConflictResolutionChange}
                disabledRowIds={disabledRowIds}
            />

            <div className="flex justify-end">
                {hasConflicts ? (
                    <Button
                        onClick={handleResolveConflicts}
                        disabled={
                            !allConflictsResolved ||
                            isResolveSessionConflictsPending
                        }
                    >
                        {isResolveSessionConflictsPending
                            ? 'Resolving…'
                            : 'Resolve & Continue'}
                    </Button>
                ) : (
                    <Button onClick={onGoToNextStep}>
                        Continue to Image Review
                    </Button>
                )}
            </div>
        </div>
    );
}
