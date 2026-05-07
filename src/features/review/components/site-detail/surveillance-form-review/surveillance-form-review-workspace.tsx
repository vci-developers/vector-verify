'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import SurveillanceFormConflictView from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-conflict-view';
import { normalizeSessionRows } from '@/features/review/utils/normalize-form-data';

interface SurveillanceFormReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    onResolved?: () => void;
}

export default function SurveillanceFormReviewWorkspace({
    siteId,
    startDate,
    endDate,
    onResolved,
}: SurveillanceFormReviewWorkspaceProps) {
    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions({ siteId, startDate, endDate });

    const sessions = getSessionsResult?.ok
        ? getSessionsResult.data.sessions
        : [];

    const surveillanceFormQueries = useGetSurveillanceFormsBySessionIds(
        sessions.map(session => session.sessionId),
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

    if (surveillanceFormQueries.some(query => query.isPending)) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    const failedQuery = surveillanceFormQueries.find(
        query =>
            query.data &&
            !query.data.ok &&
            query.data.error.kind !== 'not_found',
    );
    if (failedQuery?.data && !failedQuery.data.ok) {
        return (
            <p className="text-destructive text-sm">
                {failedQuery.data.error.message}
            </p>
        );
    }

    const formDataBySessionId = new Map<number, SurveillanceFormData>();
    for (const query of surveillanceFormQueries) {
        if (query.data?.ok) {
            formDataBySessionId.set(query.data.data.sessionId, query.data.data);
        }
    }

    const surveillanceForms = sessions.map(session => ({
        session,
        rows: normalizeSessionRows(
            session,
            formDataBySessionId.get(session.sessionId) ?? null,
        ),
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

            <SurveillanceFormConflictView
                surveillanceForms={surveillanceForms}
                onResolved={onResolved}
            />
        </div>
    );
}
