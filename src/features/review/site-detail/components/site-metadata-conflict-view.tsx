'use client';

import { useState } from 'react';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import type { Session } from '@/api/session/validation/session-schema';
import type { SurveillanceForm } from '@/api/surveillance-form/validation/surveillance-form-schema';
import type { SessionWithFormData } from '@/api/surveillance-form/validation/session-with-form-data-schema';
import { Button } from '@/components/ui/button';
import { getConflictingLabels } from '@/features/review/site-detail/utils/detect-session-conflicts';
import SurveillanceFormReviewTable from './surveillance-form-review-table';

type ResolvableSessionKey =
    | 'collectorName'
    | 'collectorTitle'
    | 'collectionMethod';

const SESSION_FIELD_LABELS: Record<string, ResolvableSessionKey> = {
    'Collector Name': 'collectorName',
    'Collector Title': 'collectorTitle',
    'Collection Method': 'collectionMethod',
};

interface SiteMetadataConflictViewProps {
    sessions: SessionWithFormData[];
    onResolved?: () => void;
}

export default function SiteMetadataConflictView({
    sessions,
    onResolved,
}: SiteMetadataConflictViewProps) {
    const [resolutions, setResolutions] = useState<Map<string, string>>(
        new Map(),
    );
    const [resolveError, setResolveError] = useState<string | null>(null);

    const resolveSessionConflictsMutation = useResolveSessionConflicts();

    const conflictingLabels = getConflictingLabels(sessions);
    const hasConflict = conflictingLabels.size > 0;

    const allConflictsResolved = Array.from(conflictingLabels).every(label =>
        resolutions.has(label),
    );

    function handleResolutionChange(label: string, value: string) {
        setResolutions(prev => new Map(prev).set(label, value));
    }

    function handleResolve() {
        const baseSession = sessions[0];
        if (!baseSession) return;

        const resolvedSessionFields: Partial<
            Pick<Session, ResolvableSessionKey>
        > = {};

        for (const [label, value] of resolutions) {
            const sessionKey = SESSION_FIELD_LABELS[label];
            if (sessionKey !== undefined) {
                resolvedSessionFields[sessionKey] = value;
            }
        }

        const resolvedData: Session = {
            ...baseSession.session,
            ...resolvedSessionFields,
        };

        let resolvedSurveillanceForm: SurveillanceForm | null = null;
        if (baseSession.formData?.kind === 'legacy') {
            resolvedSurveillanceForm = baseSession.formData;
        }

        setResolveError(null);
        resolveSessionConflictsMutation.mutate(
            {
                sessionIds: sessions.map(
                    sessionAndFormData => sessionAndFormData.session.sessionId,
                ),
                resolvedData,
                resolvedSurveillanceForm,
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
                sessions={sessions}
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
