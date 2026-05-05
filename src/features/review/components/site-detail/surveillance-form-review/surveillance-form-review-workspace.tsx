'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, Loader2, TriangleAlert } from 'lucide-react';
import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useGetAllSurveillanceForms } from '@/api/surveillance-form/hooks/use-get-all-surveillance-forms';
import { usePutSurveillanceForm } from '@/api/surveillance-form/hooks/use-put-surveillance-form';
import { usePutSession } from '@/api/session/hooks/use-put-session';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';
import {
    computeConflicts,
    DATA_FIELDS,
    formatFieldValue,
    type SessionWithForm,
} from '@/features/review/utils/surveillance-form-fields';
import { Button } from '@/components/ui/button';
import { sessionKeys } from '@/api/session/session-keys';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { useQueryClient } from '@tanstack/react-query';

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
    const [submitError, setSubmitError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const queryClient = useQueryClient();

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

    const { mutateAsync: putSurveillanceFormAsync } = usePutSurveillanceForm();
    const { mutateAsync: putSessionAsync } = usePutSession();

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
        getAllSurveillanceFormsResult.data.surveillanceForms.map(f => [
            f.sessionId,
            f,
        ]),
    );

    const surveillanceForms: SessionWithForm[] = sessions.map(session => ({
        session,
        form: formsMap.get(session.sessionId) ?? null,
    }));

    const conflictMap = computeConflicts(surveillanceForms);
    const conflictedFieldKeys = Object.keys(conflictMap);
    const unresolvedCount = conflictedFieldKeys.filter(
        key => resolutions[key] === undefined,
    ).length;
    const hasConflicts = conflictedFieldKeys.length > 0;

    async function handleSubmit() {
        setSubmitError(null);
        setIsPending(true);

        const sessionUpdateFields: Record<string, unknown> = {};
        const formUpdateFields: Record<string, unknown> = {};

        for (const [fieldKey, displayValue] of Object.entries(resolutions)) {
            const fieldDef = DATA_FIELDS.find(f => f.fieldKey === fieldKey);
            if (!fieldDef) continue;

            const parsed = fieldDef.parseForPut(displayValue);
            if (fieldDef.source === 'session') {
                sessionUpdateFields[fieldKey] = parsed;
            } else {
                formUpdateFields[fieldKey] = parsed;
            }
        }

        const results = await Promise.all(
            surveillanceForms.map(({ session, form }) =>
                Promise.all([
                    putSessionAsync({
                        sessionId: session.sessionId,
                        requestBody: {
                            ...sessionUpdateFields,
                            state: 'IN_REVIEW',
                        },
                    }),
                    form
                        ? putSurveillanceFormAsync({
                              formId: form.formId,
                              requestBody: formUpdateFields,
                          })
                        : Promise.resolve(null),
                ]),
            ),
        );

        const firstError = results.flat().find(r => r !== null && !r.ok);

        if (firstError && !firstError.ok) {
            setSubmitError(firstError.error.message ?? 'Submission failed.');
            setIsPending(false);
            return;
        }

        await queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        await queryClient.invalidateQueries({
            queryKey: surveillanceFormKeys.root,
        });
        onSuccess();
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
                        surveillanceForms={surveillanceForms}
                        conflicts={conflictMap}
                        resolutions={resolutions}
                        onResolve={(fieldKey, displayValue) =>
                            setResolutions(prev => ({
                                ...prev,
                                [fieldKey]: displayValue,
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

                    {submitError && (
                        <p className="text-destructive text-sm">
                            {submitError}
                        </p>
                    )}

                    <div className="flex justify-end">
                        <Button
                            disabled={unresolvedCount > 0 || isPending}
                            onClick={handleSubmit}
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
                    surveillanceForms={surveillanceForms}
                    isPending={isPending}
                    onContinue={handleSubmit}
                />
            )}
        </div>
    );
}

function NoConflictsCard({
    surveillanceForms,
    isPending,
    onContinue,
}: {
    surveillanceForms: SessionWithForm[];
    isPending: boolean;
    onContinue: () => void;
}) {
    const [sample] = surveillanceForms;
    if (sample === undefined) return null;

    return (
        <div className="rounded-lg border border-green-200 bg-green-50 p-6 dark:border-green-900 dark:bg-green-950/30">
            <div className="mb-4 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
                <h3 className="font-semibold text-green-800 dark:text-green-300">
                    All {surveillanceForms.length} sessions are consistent
                </h3>
            </div>

            <div className="mb-6 grid grid-cols-2 gap-x-8 gap-y-2">
                {DATA_FIELDS.map(field => (
                    <div key={field.fieldKey} className="flex gap-2 text-sm">
                        <span className="text-muted-foreground min-w-32 shrink-0">
                            {field.label}
                        </span>
                        <span className="font-medium">
                            {formatFieldValue(
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
