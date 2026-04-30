'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetAllSurveillanceForms } from '@/api/surveillance-form/hooks/use-get-all-surveillance-forms';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';
import { useMemo } from 'react';

interface SessionWithForm {
    session: Session;
    form: SurveillanceForm | null;
}

interface SurveillanceFormReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function SurveillanceFormReviewWorkspace({
    siteId,
    startDate,
    endDate,
}: SurveillanceFormReviewWorkspaceProps) {
    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions({ siteId, startDate, endDate });

    const { sessions, sessionIds } = useMemo(() => {
        const sessions = getSessionsResult?.ok
            ? getSessionsResult.data.sessions
            : [];
        return {
            sessions,
            sessionIds: sessions.map(session => session.sessionId),
        };
    }, [getSessionsResult]);

    const {
        data: getAllSurveillanceFormsResult,
        isPending: isGetAllSurveillanceFormsPending,
    } = useGetAllSurveillanceForms(
        { sessionId: sessionIds },
        { enabled: sessionIds.length > 0 },
    );

    if (isGetSessionsPending || !getSessionsResult) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    if (!getSessionsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getSessionsResult.error.message}
            </p>
        );
    }

    if (sessions.length === 0) {
        return (
            <p className="text-muted-foreground text-sm">
                No sessions found for this site.
            </p>
        );
    }

    if (isGetAllSurveillanceFormsPending || !getAllSurveillanceFormsResult) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    if (!getAllSurveillanceFormsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSurveillanceFormsResult.error.message}
            </p>
        );
    }

    const formsMap = new Map(
        getAllSurveillanceFormsResult.data.surveillanceForms.map(
            surveillanceForm => [surveillanceForm.sessionId, surveillanceForm],
        ),
    );

    const surveillanceForms: SessionWithForm[] = sessions.map(session => ({
        session,
        form: formsMap.get(session.sessionId) ?? null,
    }));

    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">
                    Step 1: Surveillance Form Comparison
                </h2>
                <p className="text-muted-foreground text-sm">
                    Review and resolve any discrepancies across sessions. All
                    sessions must match.
                </p>
            </div>

            <SurveillanceFormReviewTable
                surveillanceForms={surveillanceForms}
            />
        </div>
    );
}
