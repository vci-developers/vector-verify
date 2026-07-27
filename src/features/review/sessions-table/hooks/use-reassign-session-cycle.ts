'use client';

import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import { fetchAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import { sessionKeys } from '@/api/session/session-keys';
import type { Session } from '@/api/session/validation/session-schema';
import { getReviewUnitSessionSummary } from '@/features/review/sessions-table/utils/get-review-unit-session-summary';
import { isSiteFullyReviewed } from '@/features/review/utils/review-site-session-summary';

interface PendingReassignment {
    session: Session;
    newCollectionCycleId: number;
    unitSessions: Session[];
    sourceUnitResetRequired: boolean;
    destinationUnitResetRequired: boolean;
}

export function useReassignSessionCycle() {
    const t = useTranslations('ReviewSessionsTable');
    const queryClient = useQueryClient();
    const { mutateAsync: putSessionByIdAsync } = usePutSessionById();
    const [pendingReassignment, setPendingReassignment] =
        useState<PendingReassignment | null>(null);
    const [isReassigning, setIsReassigning] = useState(false);

    async function performReassignment({
        session,
        newCollectionCycleId,
        unitSessions,
        sourceUnitResetRequired,
        destinationUnitResetRequired,
    }: PendingReassignment) {
        const previousCollectionCycleId = session.collectionCycleId;
        const resetRequired =
            sourceUnitResetRequired || destinationUnitResetRequired;

        setIsReassigning(true);

        const movedSessionResult = await putSessionByIdAsync({
            sessionId: session.sessionId,
            requestBody: {
                collectionCycleId: newCollectionCycleId,
                ...(resetRequired ? { state: 'NEEDS_REVIEW' as const } : {}),
            },
        });

        if (!resetRequired) {
            setIsReassigning(false);
            if (!movedSessionResult.ok) {
                toast.error(t('reassignError'));
                return;
            }
            toast.success(t('reassignSuccess'));
            return;
        }

        const affectedSiblingSessions = unitSessions.filter(
            otherSession =>
                otherSession.sessionId !== session.sessionId &&
                ((sourceUnitResetRequired &&
                    otherSession.collectionCycleId ===
                        previousCollectionCycleId) ||
                    (destinationUnitResetRequired &&
                        otherSession.collectionCycleId ===
                            newCollectionCycleId)),
        );

        const siblingOutcomes = await Promise.allSettled(
            affectedSiblingSessions.map(otherSession =>
                putSessionByIdAsync({
                    sessionId: otherSession.sessionId,
                    requestBody: { state: 'NEEDS_REVIEW' },
                }),
            ),
        );

        setIsReassigning(false);

        const failedCount =
            (movedSessionResult.ok ? 0 : 1) +
            siblingOutcomes.filter(
                outcome => outcome.status !== 'fulfilled' || !outcome.value.ok,
            ).length;

        if (failedCount > 0) {
            toast.error(t('reassignError'));
            return;
        }

        toast.success(t('reassignResetSuccess'));
    }

    async function requestReassignment(
        session: Session,
        newCollectionCycleId: number,
    ) {
        const unitSessionsResult = await queryClient.fetchQuery({
            queryKey: sessionKeys.allSessions({ siteIds: [session.siteId] }),
            queryFn: () => fetchAllSessions({ siteIds: [session.siteId] }),
        });

        if (!unitSessionsResult.ok) {
            toast.error(t('reassignError'));
            return;
        }

        const unitSessions = unitSessionsResult.data.sessions;

        const sourceUnitResetRequired = isSiteFullyReviewed(
            getReviewUnitSessionSummary(
                unitSessions,
                session.siteId,
                session.collectionCycleId,
            ),
        );
        const destinationUnitResetRequired = isSiteFullyReviewed(
            getReviewUnitSessionSummary(
                unitSessions,
                session.siteId,
                newCollectionCycleId,
            ),
        );

        const reassignment: PendingReassignment = {
            session,
            newCollectionCycleId,
            unitSessions,
            sourceUnitResetRequired,
            destinationUnitResetRequired,
        };

        if (!sourceUnitResetRequired && !destinationUnitResetRequired) {
            await performReassignment(reassignment);
            return;
        }

        setPendingReassignment(reassignment);
    }

    function cancelReassignment() {
        setPendingReassignment(null);
    }

    async function confirmReassignment() {
        if (!pendingReassignment) return;
        const reassignment = pendingReassignment;
        setPendingReassignment(null);
        await performReassignment(reassignment);
    }

    return {
        requestReassignment,
        isConfirmDialogOpen: pendingReassignment !== null,
        cancelReassignment,
        confirmReassignment,
        isReassigning,
    };
}
