'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetAllSurveillanceForms } from '@/api/surveillance-form/hooks/use-get-all-surveillance-forms';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';
import {
    findSurveillanceFormFieldConflicts,
    SURVEILLANCE_FORM_FIELDS,
    formatSurveillanceFormFieldValue,
    type SessionWithSurveillanceForm,
} from '@/features/review/utils/surveillance-form-fields';
import { useSurveillanceFormReviewSubmit } from '@/features/review/components/site-detail/surveillance-form-review/use-surveillance-form-review-submit';
import { Button } from '@/components/ui/button';

interface SurveillanceFormReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    onSuccess: () => void;
}

export default function SurveillanceFormReviewWorkspace({
    siteId,
    startDate,
    endDate,
    onSuccess,
}: SurveillanceFormReviewWorkspaceProps) {
    const [resolutions, setResolutions] = useState<Record<string, string>>({});

    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions({ siteId, startDate, endDate });

    const { sessions, sessionIds } = useMemo(() => {
        const sessions = getSessionsResult?.ok
            ? getSessionsResult.data.sessions
            : [];
        return { sessions, sessionIds: sessions.map(s => s.sessionId) };
    }, [getSessionsResult]);

    const {
        data: getAllSurveillanceFormsResult,
        isPending: isGetAllSurveillanceFormsPending,
    } = useGetAllSurveillanceForms(
        { sessionId: sessionIds },
        { enabled: sessionIds.length > 0 },
    );

    const sessionsWithForms = useMemo<SessionWithSurveillanceForm[]>(() => {
        if (!getSessionsResult?.ok || !getAllSurveillanceFormsResult?.ok)
            return [];
        const surveillanceFormsBySessionId = new Map(
            getAllSurveillanceFormsResult.data.surveillanceForms.map(
                surveillanceForm => [
                    surveillanceForm.sessionId,
                    surveillanceForm,
                ],
            ),
        );
        return sessions.map(session => ({
            session,
            form: surveillanceFormsBySessionId.get(session.sessionId) ?? null,
        }));
    }, [getSessionsResult, getAllSurveillanceFormsResult, sessions]);

    const fieldConflicts = useMemo(
        () => findSurveillanceFormFieldConflicts(sessionsWithForms),
        [sessionsWithForms],
    );
    const conflictedFieldKeys = Object.keys(fieldConflicts);
    const unresolvedCount = conflictedFieldKeys.filter(
        key => resolutions[key] === undefined,
    ).length;
    const hasConflicts = conflictedFieldKeys.length > 0;

    const { submit, isPending, error } = useSurveillanceFormReviewSubmit({
        sessionsWithForms,
        resolutions,
        onSuccess,
    });

    if (
        isGetSessionsPending ||
        !getSessionsResult ||
        (sessionIds.length > 0 &&
            (isGetAllSurveillanceFormsPending ||
                !getAllSurveillanceFormsResult))
    ) {
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

    if (!getAllSurveillanceFormsResult?.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSurveillanceFormsResult?.error.message}
            </p>
        );
    }

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

            {hasConflicts ? (
                <>
                    <SurveillanceFormReviewTable
                        sessionsWithForms={sessionsWithForms}
                        fieldConflicts={fieldConflicts}
                        resolutions={resolutions}
                        onResolve={(fieldKey, resolvedFieldValue) =>
                            setResolutions(prev => ({
                                ...prev,
                                [fieldKey]: resolvedFieldValue,
                            }))
                        }
                    />

                    {unresolvedCount > 0 && (
                        <div className="border-destructive/50 bg-destructive/10 text-destructive flex items-center gap-2 rounded-md border px-4 py-3 text-sm font-medium">
                            <TriangleAlert className="h-4 w-4 shrink-0" />
                            {unresolvedCount}{' '}
                            {unresolvedCount === 1 ? 'conflict' : 'conflicts'}{' '}
                            remaining
                        </div>
                    )}

                    {error && (
                        <p className="text-destructive text-sm">{error}</p>
                    )}

                    <div className="flex justify-end">
                        <Button
                            disabled={unresolvedCount > 0 || isPending}
                            onClick={submit}
                        >
                            {isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Confirm &amp; Continue
                        </Button>
                    </div>
                </>
            ) : (
                <NoConflictsCard
                    sessionsWithForms={sessionsWithForms}
                    isPending={isPending}
                    onContinue={submit}
                />
            )}
        </div>
    );
}

function NoConflictsCard({
    sessionsWithForms,
    isPending,
    onContinue,
}: {
    sessionsWithForms: SessionWithSurveillanceForm[];
    isPending: boolean;
    onContinue: () => void;
}) {
    const [sample] = sessionsWithForms;
    if (sample === undefined) return null;

    return (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
            <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                    All {sessionsWithForms.length} sessions are consistent
                </h3>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2">
                {SURVEILLANCE_FORM_FIELDS.map(field => (
                    <div key={field.fieldKey} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground min-w-32 shrink-0">
                            {field.label}
                        </span>
                        <span className="font-medium">
                            {formatSurveillanceFormFieldValue(
                                field.getValue(sample.session, sample.form),
                            )}
                        </span>
                    </div>
                ))}
            </div>

            <div className="flex justify-end">
                <Button disabled={isPending} onClick={onContinue}>
                    {isPending && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Continue to Image Review
                </Button>
            </div>
        </div>
    );
}
