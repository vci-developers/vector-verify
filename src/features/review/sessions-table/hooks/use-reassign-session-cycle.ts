'use client';

import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import type { Session } from '@/api/session/validation/session-schema';
import { accumulateSessionSummary } from '@/features/review/utils/accumulate-session-summary';
import {
    emptySessionSummary,
    isSiteFullyReviewed,
    type ReviewSiteSessionSummary,
} from '@/features/review/utils/review-site-session-summary';

function getReviewUnitSessionSummary(
    sessions: Session[],
    siteId: number,
    collectionCycleId: number | null,
): ReviewSiteSessionSummary {
    return sessions
        .filter(
            session =>
                session.siteId === siteId &&
                session.collectionCycleId === collectionCycleId,
        )
        .reduce(
            (summary, session) => accumulateSessionSummary(summary, session),
            emptySessionSummary(),
        );
}

interface CycleReassignment {
    session: Session;
    newCollectionCycleId: number;
    unitSessions: Session[];
    previousUnitWasFullyReviewed: boolean;
    newUnitWasFullyReviewed: boolean;
}

export function useReassignSessionCycle() {
    const t = useTranslations('ReviewSessionsTable');
    const { mutateAsync: putSessionByIdAsync } = usePutSessionById();
    const [pendingReassignment, setPendingReassignment] =
        useState<CycleReassignment | null>(null);
    const [isReassigning, setIsReassigning] = useState(false);
    const [sessionReassignmentRequest, setSessionReassignmentRequest] =
        useState<{
            session: Session;
            newCollectionCycleId: number;
        } | null>(null);

    const { data: unitSessionsResult, isFetching: isUnitSessionsFetching } =
        useGetAllSessions(
            {
                siteIds: sessionReassignmentRequest
                    ? [sessionReassignmentRequest.session.siteId]
                    : [],
            },
            { enabled: sessionReassignmentRequest !== null },
        );

    const performReassignment = useCallback(
        async ({
            session,
            newCollectionCycleId,
            unitSessions,
            previousUnitWasFullyReviewed,
            newUnitWasFullyReviewed,
        }: CycleReassignment) => {
            const previousCollectionCycleId = session.collectionCycleId;
            const resetRequired =
                previousUnitWasFullyReviewed || newUnitWasFullyReviewed;

            setIsReassigning(true);

            const movedSessionResult = await putSessionByIdAsync({
                sessionId: session.sessionId,
                requestBody: {
                    collectionCycleId: newCollectionCycleId,
                    ...(resetRequired
                        ? { state: 'NEEDS_REVIEW' as const }
                        : {}),
                },
            });

            if (!movedSessionResult.ok) {
                setIsReassigning(false);
                toast.error(t('reassignError'));
                return;
            }

            if (!resetRequired) {
                setIsReassigning(false);
                toast.success(t('reassignSuccess'));
                return;
            }

            const affectedSiblingSessions = unitSessions.filter(
                unitSession =>
                    unitSession.sessionId !== session.sessionId &&
                    ((previousUnitWasFullyReviewed &&
                        unitSession.collectionCycleId ===
                            previousCollectionCycleId) ||
                        (newUnitWasFullyReviewed &&
                            unitSession.collectionCycleId ===
                                newCollectionCycleId)),
            );

            const siblingSessionResults = await Promise.allSettled(
                affectedSiblingSessions.map(unitSession =>
                    putSessionByIdAsync({
                        sessionId: unitSession.sessionId,
                        requestBody: { state: 'NEEDS_REVIEW' },
                    }),
                ),
            );

            setIsReassigning(false);

            const failedCount = siblingSessionResults.filter(
                siblingSessionResult =>
                    siblingSessionResult.status !== 'fulfilled' ||
                    !siblingSessionResult.value.ok,
            ).length;

            if (failedCount > 0) {
                toast.error(t('reassignError'));
                return;
            }

            toast.success(t('reassignResetSuccess'));
        },
        [putSessionByIdAsync, t],
    );

    const requestReassignment = useCallback(
        (session: Session, newCollectionCycleId: number) => {
            setSessionReassignmentRequest({ session, newCollectionCycleId });
        },
        [],
    );

    useEffect(() => {
        if (!sessionReassignmentRequest) return;
        if (isUnitSessionsFetching || !unitSessionsResult) return;

        const { session, newCollectionCycleId } = sessionReassignmentRequest;
        setSessionReassignmentRequest(null);

        if (!unitSessionsResult.ok) {
            toast.error(t('reassignError'));
            return;
        }

        const unitSessions = unitSessionsResult.data.sessions;

        const previousUnitWasFullyReviewed = isSiteFullyReviewed(
            getReviewUnitSessionSummary(
                unitSessions,
                session.siteId,
                session.collectionCycleId,
            ),
        );
        const newUnitWasFullyReviewed = isSiteFullyReviewed(
            getReviewUnitSessionSummary(
                unitSessions,
                session.siteId,
                newCollectionCycleId,
            ),
        );

        const reassignment: CycleReassignment = {
            session,
            newCollectionCycleId,
            unitSessions,
            previousUnitWasFullyReviewed,
            newUnitWasFullyReviewed,
        };

        if (!previousUnitWasFullyReviewed && !newUnitWasFullyReviewed) {
            void performReassignment(reassignment);
            return;
        }

        setPendingReassignment(reassignment);
    }, [
        sessionReassignmentRequest,
        isUnitSessionsFetching,
        unitSessionsResult,
        t,
        performReassignment,
    ]);

    const cancelReassignment = useCallback(() => {
        setPendingReassignment(null);
    }, []);

    const confirmReassignment = useCallback(async () => {
        if (!pendingReassignment) return;
        const reassignment = pendingReassignment;
        setPendingReassignment(null);
        await performReassignment(reassignment);
    }, [pendingReassignment, performReassignment]);

    return {
        requestReassignment,
        isConfirmDialogOpen: pendingReassignment !== null,
        cancelReassignment,
        confirmReassignment,
        isReassigning: isReassigning || sessionReassignmentRequest !== null,
    };
}
