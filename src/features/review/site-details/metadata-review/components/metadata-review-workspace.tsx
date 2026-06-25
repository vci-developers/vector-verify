'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import {
    applyConflictResolutions,
    buildMetadataRows,
} from '@/features/review/site-details/metadata-review/utils/metadata-review-helpers';
import { Button } from '@/components/ui/button';
import MetadataReviewTable from './metadata-review-table';
import { useQueryClient } from '@tanstack/react-query';
import { sessionKeys } from '@/api/session/session-keys';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { useMetadataReviewState } from '@/features/review/site-details/metadata-review/utils/use-metadata-review-state';

interface MetadataReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    collectionCycleId?: number;
    onGoToNextStep: () => void;
}

export default function MetadataReviewWorkspace({
    siteId,
    startDate,
    endDate,
    collectionCycleId,
    onGoToNextStep,
}: MetadataReviewWorkspaceProps) {
    const {
        resolutionsByMetadataRowId,
        handleConflictResolutionChange,
        disabledRowIds,
        resetResolutions,
    } = useMetadataReviewState();

    const queryClient = useQueryClient();

    const sessionQueryParams: GetAllSessionsQueryParams =
        collectionCycleId !== undefined
            ? {
                  siteIds: [siteId],
                  collectionCycleId,
                  type: 'SURVEILLANCE',
              }
            : {
                  siteIds: [siteId],
                  startDate,
                  endDate,
                  type: 'SURVEILLANCE',
              };

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions(sessionQueryParams);
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
        return <h1>Loading...</h1>;
    }

    if (!getAllSessionsResult.ok) {
        return <h1>Error: {getAllSessionsResult.error.message}</h1>;
    }

    if (allSessionsForSite.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No sessions found for this site.
            </p>
        );
    }

    if (allSurveillanceFormQueriesForSite.some(query => query.isPending)) {
        return <h1>Loading...</h1>;
    }

    const failedQuery = allSurveillanceFormQueriesForSite.find(
        query =>
            query.data &&
            !query.data.ok &&
            query.data.error.kind !== 'not_found',
    );
    if (failedQuery?.data && !failedQuery.data.ok) {
        return <h1>Error: {failedQuery.data.error.message}</h1>;
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
                            queryKey: sessionKeys.root,
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
                    }
                },
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
