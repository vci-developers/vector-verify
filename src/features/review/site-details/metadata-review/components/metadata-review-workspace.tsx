'use client';

import { useTranslations } from 'next-intl';
import { networkErrorMessage } from '@/lib/network/network-error';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import { useGetFormAnswersBySessionIds } from '@/api/form-answer/hooks/use-get-form-answers-by-session-ids';
import { buildMetadataRows } from '@/features/review/site-details/metadata-review/utils/build-metadata-rows';
import { Button } from '@/components/ui/button';
import MetadataReviewTable from './metadata-review-table';
import { useMetadataReviewState } from '@/features/review/site-details/metadata-review/hooks/use-metadata-review-state';
import { useResolveMetadataConflicts } from '@/features/review/site-details/metadata-review/hooks/use-resolve-metadata-conflicts';

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
    const {
        resolutionsByMetadataRowId,
        handleConflictResolutionChange,
        disabledRowIds,
        resetResolutions,
    } = useMetadataReviewState();

    const t = useTranslations('MetadataReview');
    const tCommon = useTranslations('Common');

    const { submitResolutions, isSubmitting, resolveError } =
        useResolveMetadataConflicts({ siteId, startDate, endDate });

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({ siteId, startDate, endDate, type: 'SURVEILLANCE' });
    const allSessionsForSite = getAllSessionsResult?.ok
        ? getAllSessionsResult.data.sessions
        : [];

    const allSurveillanceFormQueriesForSite =
        useGetSurveillanceFormsBySessionIds(
            allSessionsForSite.map(session => session.sessionId),
        );

    const allFormAnswerQueriesForSite = useGetFormAnswersBySessionIds(
        allSessionsForSite.map(session => session.sessionId),
    );

    const isAnyQueryPending =
        isGetAllSessionsPending ||
        allSurveillanceFormQueriesForSite.some(query => query.isPending) ||
        allFormAnswerQueriesForSite.some(query => query.isPending);

    if (isAnyQueryPending || !getAllSessionsResult) {
        return <h1>{tCommon('loading')}</h1>;
    }

    if (!getAllSessionsResult.ok) {
        return (
            <h1>
                {t('loadError', {
                    message: networkErrorMessage(getAllSessionsResult.error),
                })}
            </h1>
        );
    }

    if (allSessionsForSite.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                {t('noSessionsFound')}
            </p>
        );
    }

    const failedQuery = [
        ...allSurveillanceFormQueriesForSite,
        ...allFormAnswerQueriesForSite,
    ].find(
        query =>
            query.data &&
            !query.data.ok &&
            query.data.error.kind !== 'not_found',
    );
    if (failedQuery?.data && !failedQuery.data.ok) {
        return (
            <h1>
                {t('loadError', {
                    message: networkErrorMessage(failedQuery.data.error),
                })}
            </h1>
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

    const formAnswersBySessionId = new Map(
        allSessionsForSite.map((session, index) => [
            session.sessionId,
            allFormAnswerQueriesForSite[index]?.data?.ok
                ? allFormAnswerQueriesForSite[index].data.data
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

    const { rows: metadataRows, unitGroups } = buildMetadataRows(
        allSessionsForSite,
        surveillanceFormsBySessionId,
        formAnswersBySessionId,
    );

    const hasMissingUnit = unitGroups.some(
        group =>
            group.sessionUnitIdsBySessionId.size < allSessionsForSite.length,
    );
    const hasConflicts =
        metadataRows.some(row => row.hasConflict) || hasMissingUnit;
    const allConflictsResolved =
        !hasMissingUnit &&
        metadataRows.every(
            row => !row.hasConflict || resolutionsByMetadataRowId.has(row.id),
        );

    async function handleResolveConflicts() {
        const succeeded = await submitResolutions({
            metadataRows,
            unitGroups,
            resolutionsByMetadataRowId,
            sessions: allSessionsForSite,
        });

        if (succeeded) {
            resetResolutions();
            onGoToNextStep();
        }
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">{t('intro')}</p>

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

            {resolveError && (
                <p className="text-destructive text-sm">{resolveError}</p>
            )}

            <div className="flex justify-end">
                {hasConflicts ? (
                    <Button
                        onClick={handleResolveConflicts}
                        disabled={!allConflictsResolved || isSubmitting}
                    >
                        {isSubmitting
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
