'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useQueryClient } from '@tanstack/react-query';
import type { Session } from '@/api/session/validation/session-schema';
import { useResolveSessionConflicts } from '@/api/session/hooks/use-resolve-session-conflicts';
import { sessionKeys } from '@/api/session/session-keys';
import { surveillanceFormKeys } from '@/api/surveillance-form/surveillance-form-keys';
import { formAnswerKeys } from '@/api/form-answer/form-answer-keys';
import { applyConflictResolutions } from '@/features/review/site-details/metadata-review/utils/apply-conflict-resolutions';
import type {
    MetadataRow,
    UnitGroupMeta,
} from '@/features/review/site-details/metadata-review/utils/metadata-row-types';

interface UseResolveMetadataConflictsParams {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

interface SubmitResolutionsParams {
    metadataRows: MetadataRow[];
    unitGroups: UnitGroupMeta[];
    resolutionsByMetadataRowId: Map<string, string>;
    sessions: Session[];
}

export function useResolveMetadataConflicts({
    siteId,
    startDate,
    endDate,
}: UseResolveMetadataConflictsParams) {
    const t = useTranslations('MetadataReview');
    const queryClient = useQueryClient();
    const { mutateAsync: resolveSessionConflictsAsync } =
        useResolveSessionConflicts();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [resolveError, setResolveError] = useState<string | null>(null);

    async function submitResolutions({
        metadataRows,
        unitGroups,
        resolutionsByMetadataRowId,
        sessions,
    }: SubmitResolutionsParams): Promise<boolean> {
        const {
            resolvedSession,
            resolvedSurveillanceForm,
            resolvedFormAnswers,
            unitFormAnswersByUnitIdentity,
        } = applyConflictResolutions(metadataRows, resolutionsByMetadataRowId);

        const hasSessionLevelConflicts = metadataRows.some(
            row =>
                (row.entity === 'session' ||
                    row.entity === 'surveillanceForm' ||
                    row.entity === 'formAnswer') &&
                row.hasConflict,
        );

        setIsSubmitting(true);
        setResolveError(null);

        let failed = false;

        for (const [
            unitIdentity,
            resolvedUnitFormAnswers,
        ] of unitFormAnswersByUnitIdentity) {
            const unitGroup = unitGroups.find(
                group => group.unitIdentity === unitIdentity,
            );
            if (!unitGroup || unitGroup.sessionUnitIdsBySessionId.size < 2) {
                continue;
            }

            const result = await resolveSessionConflictsAsync({
                sessionUnitIds: [
                    ...unitGroup.sessionUnitIdsBySessionId.values(),
                ],
                resolvedFormAnswers: resolvedUnitFormAnswers,
            });

            if (!result.ok) {
                setResolveError(result.error.message ?? t('genericError'));
                failed = true;
                break;
            }
        }

        if (!failed && hasSessionLevelConflicts) {
            const result = await resolveSessionConflictsAsync({
                sessionIds: sessions.map(session => session.sessionId),
                resolvedData: resolvedSession,
                resolvedSurveillanceForm,
                resolvedFormAnswers:
                    resolvedFormAnswers.length > 0
                        ? resolvedFormAnswers
                        : undefined,
            });

            if (!result.ok) {
                setResolveError(result.error.message ?? t('genericError'));
                failed = true;
            }
        }

        setIsSubmitting(false);

        queryClient.invalidateQueries({
            queryKey: sessionKeys.allSessions({
                siteId,
                startDate,
                endDate,
                type: 'SURVEILLANCE',
            }),
        });
        for (const session of sessions) {
            queryClient.invalidateQueries({
                queryKey: surveillanceFormKeys.surveillanceFormBySessionId(
                    session.sessionId,
                ),
            });
            queryClient.invalidateQueries({
                queryKey: formAnswerKeys.formAnswersBySessionId(
                    session.sessionId,
                ),
            });
        }

        return !failed;
    }

    return { submitResolutions, isSubmitting, resolveError };
}
