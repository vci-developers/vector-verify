'use client';

import { useState } from 'react';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import type { Session } from '@/api/session/validation/session-schema';
import type { SessionWithFormFieldRows } from '@/api/surveillance-form/validation/session-with-rows-schema';
import { Button } from '@/components/ui/button';
import SurveillanceFormReviewTable from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-table';
import { getConflictingLabels } from '@/features/review/utils/detect-session-conflicts';

type ResolvableSessionKey =
    | 'collectorName'
    | 'collectorTitle'
    | 'collectionMethod';

const SESSION_FIELD_LABELS: Record<string, ResolvableSessionKey> = {
    'Collector Name': 'collectorName',
    'Collector Title': 'collectorTitle',
    'Collection Method': 'collectionMethod',
};

interface SurveillanceFormConflictViewProps {
    surveillanceForms: SessionWithFormFieldRows[];
    onResolved?: () => void;
}

export default function SurveillanceFormConflictView({
    surveillanceForms,
    onResolved,
}: SurveillanceFormConflictViewProps) {
    const [resolutions, setResolutions] = useState<Map<string, string>>(
        new Map(),
    );
    const [resolveError, setResolveError] = useState<string | null>(null);

    const resolveSessionConflictsMutation = useResolveSessionConflicts();

    const conflictingLabels = getConflictingLabels(surveillanceForms);
    const hasConflict = conflictingLabels.size > 0;

    const allConflictsResolved = Array.from(conflictingLabels).every(label =>
        resolutions.has(label),
    );

    function handleResolutionChange(label: string, value: string) {
        setResolutions(prev => new Map(prev).set(label, value));
    }

    function handleResolve() {
        const baseForm = surveillanceForms[0];
        if (!baseForm) return;

        const sessionOverrides: Partial<Pick<Session, ResolvableSessionKey>> =
            {};
        const formResolutions: Record<string, string> = {};

        for (const [label, value] of resolutions) {
            const sessionKey = SESSION_FIELD_LABELS[label];
            if (sessionKey !== undefined) {
                sessionOverrides[sessionKey] = value;
            } else {
                formResolutions[label] = value;
            }
        }

        const resolvedData: Session = {
            ...baseForm.session,
            ...sessionOverrides,
        };

        setResolveError(null);
        resolveSessionConflictsMutation.mutate(
            {
                sessionIds: surveillanceForms.map(
                    form => form.session.sessionId,
                ),
                resolvedData,
                resolvedSurveillanceForm: formResolutions,
            },
            {
                onSuccess: result => {
                    if (result.ok) {
                        onResolved?.();
                    } else {
                        setResolveError(
                            result.error.message ??
                                'Failed to resolve conflict. Please try again.',
                        );
                    }
                },
            },
        );
    }

    return (
        <div className="space-y-4">
            <SurveillanceFormReviewTable
                surveillanceForms={surveillanceForms}
                conflictingLabels={conflictingLabels}
                resolutions={resolutions}
                onResolutionChange={handleResolutionChange}
            />

            {resolveError && (
                <p className="text-destructive text-sm">{resolveError}</p>
            )}

            <div className="flex justify-end">
                {hasConflict ? (
                    <Button
                        onClick={handleResolve}
                        disabled={
                            !allConflictsResolved ||
                            resolveSessionConflictsMutation.isPending
                        }
                    >
                        {resolveSessionConflictsMutation.isPending
                            ? 'Resolving…'
                            : 'Resolve Conflict'}
                    </Button>
                ) : (
                    <Button onClick={onResolved}>
                        Continue to Image Review
                    </Button>
                )}
            </div>
        </div>
    );
}
