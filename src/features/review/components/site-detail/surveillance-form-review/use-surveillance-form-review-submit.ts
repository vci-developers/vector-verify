'use client';

import { useCallback, useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { usePutSurveillanceForm } from '@/api/surveillance-form/hooks/use-put-surveillance-form';
import { usePutSession } from '@/api/session/hooks/use-put-session';
import { sessionKeys } from '@/api/session/session-keys';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import {
    SURVEILLANCE_FORM_FIELDS,
    type SessionWithSurveillanceForm,
} from '@/features/review/utils/surveillance-form-fields';

export function useSurveillanceFormReviewSubmit({
    sessionsWithForms,
    resolutions,
    onSuccess,
}: {
    sessionsWithForms: SessionWithSurveillanceForm[];
    resolutions: Record<string, string>;
    onSuccess: () => void;
}) {
    const [error, setError] = useState<string | null>(null);
    const [isPending, setIsPending] = useState(false);
    const queryClient = useQueryClient();
    const { mutateAsync: putSurveillanceFormAsync } = usePutSurveillanceForm();
    const { mutateAsync: putSessionAsync } = usePutSession();

    const submit = useCallback(async () => {
        setError(null);
        setIsPending(true);

        const sessionUpdateFields: Record<string, unknown> = {};
        const formUpdateFields: Record<string, unknown> = {};

        for (const [fieldKey, resolvedFieldValue] of Object.entries(
            resolutions,
        )) {
            const fieldDef = SURVEILLANCE_FORM_FIELDS.find(
                field => field.fieldKey === fieldKey,
            );
            if (!fieldDef) continue;

            const deserialized =
                fieldDef.deserializeApiValue(resolvedFieldValue);
            if (fieldDef.source === 'session') {
                sessionUpdateFields[fieldKey] = deserialized;
            } else {
                formUpdateFields[fieldKey] = deserialized;
            }
        }

        const results = await Promise.all(
            sessionsWithForms.map(({ session, form }) =>
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
            setError(firstError.error.message ?? 'Submission failed.');
            setIsPending(false);
            return;
        }

        await queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        await queryClient.invalidateQueries({
            queryKey: surveillanceFormKeys.root,
        });
        setIsPending(false);
        onSuccess();
    }, [
        sessionsWithForms,
        resolutions,
        putSurveillanceFormAsync,
        putSessionAsync,
        queryClient,
        onSuccess,
    ]);

    return { submit, isPending, error };
}
