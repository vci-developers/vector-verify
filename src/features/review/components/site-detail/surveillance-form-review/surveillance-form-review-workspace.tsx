'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetSurveillanceFormsBySessionIds } from '@/api/surveillance-form/hooks/use-get-surveillance-form-by-session-id';
import type { FormAnswer } from '@/api/surveillance-form/validation/form-answers-schema';
import type { SurveillanceFormData } from '@/api/surveillance-form/validation/get-surveillance-form-by-session-id-schema';
import type { SessionWithRows } from '@/api/surveillance-form/validation/session-with-rows-schema';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';

interface SurveillanceFormReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

function formatValue(value: unknown): string {
    if (value === null || value === undefined) return 'N/A';
    if (typeof value === 'boolean') return value ? 'Yes' : 'No';
    return String(value);
}

function normalizeFormData(
    data: SurveillanceFormData,
): { label: string; value: string }[] {
    if (data.kind === 'answers') {
        return data.answers.flatMap((answer: FormAnswer) =>
            answer.label !== null
                ? [{ label: answer.label, value: formatValue(answer.value) }]
                : [],
        );
    }
    return [
        {
            label: 'People in House',
            value: formatValue(data.numPeopleSleptInHouse),
        },
        {
            label: 'IRS Conducted',
            value: formatValue(data.wasIrsConducted),
        },
        {
            label: 'Months Since IRS',
            value: formatValue(data.monthsSinceIrs),
        },
        {
            label: 'LLINs Available',
            value: formatValue(data.numLlinsAvailable),
        },
        { label: 'LLIN Type', value: formatValue(data.llinType) },
        { label: 'LLIN Brand', value: formatValue(data.llinBrand) },
        {
            label: 'People Under LLIN',
            value: formatValue(data.numPeopleSleptUnderLlin),
        },
    ];
}

export default function SurveillanceFormReviewWorkspace({
    siteId,
    startDate,
    endDate,
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

    const formsMap = new Map<number, { label: string; value: string }[]>();
    for (const query of surveillanceFormQueries) {
        if (query.data?.ok) {
            formsMap.set(
                query.data.data.sessionId,
                normalizeFormData(query.data.data),
            );
        }
    }

    const surveillanceForms: SessionWithRows[] = sessions.map(session => ({
        session,
        rows: formsMap.get(session.sessionId) ?? null,
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
