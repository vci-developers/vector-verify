'use client';

import Link from 'next/link';
import type { Session } from '@/api/session/validation/session-schema';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { useReviewImageAccess } from '@/features/review/workspace/hooks/use-review-image-access';
import { Button } from '@/components/ui/button';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { useTranslations } from 'next-intl';
import { TZDate } from '@date-fns/tz';
import { endOfMonth, format, startOfMonth } from 'date-fns';

interface SpecimenReviewLinkProps {
    session: Session;
    programId: number;
    specimenId: number;
    hasCollectionCycles: boolean;
    timezone?: string;
}
export default function SpecimenReviewLink({
    session,
    programId,
    specimenId,
    hasCollectionCycles,
    timezone,
}: SpecimenReviewLinkProps) {
    const t = useTranslations('ReviewSpecimens');
    const collectionMonth = new TZDate(session.collectionDate, 'UTC');
    const startDate = format(startOfMonth(collectionMonth), 'yyyy-MM-dd');
    const endDate = format(endOfMonth(collectionMonth), 'yyyy-MM-dd');
    const isUnassigned =
        hasCollectionCycles && session.collectionCycleId === null;
    const {
        data: sessionsResult,
        isPending,
        isError,
    } = useGetAllSessions(
        {
            siteIds: [session.siteId],
            ...(session.collectionCycleId !== null
                ? { collectionCycleId: session.collectionCycleId }
                : { startDate, endDate }),
            type: 'SURVEILLANCE',
        },
        { enabled: !isUnassigned },
    );
    const metadataAccess = useReviewImageAccess(
        sessionsResult?.ok ? sessionsResult.data.sessions : [],
        programId,
    );
    const access = isPending
        ? 'loading'
        : isError || (sessionsResult && !sessionsResult.ok)
          ? 'error'
          : metadataAccess;
    if (access !== 'allowed' || isUnassigned)
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span tabIndex={0}>
                        <Button variant="ghost" size="sm" disabled>
                            {t('review')}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>
                    {t(
                        isUnassigned
                            ? 'missingCycle'
                            : access === 'blocked'
                              ? 'conflicts'
                              : access === 'error'
                                ? 'accessError'
                                : 'checking',
                    )}
                </TooltipContent>
            </Tooltip>
        );
    const queryParams = new URLSearchParams({
        step: 'images',
        specimenId: String(specimenId),
    });
    if (session.collectionCycleId !== null) {
        queryParams.set('collectionCycleId', String(session.collectionCycleId));
    } else {
        queryParams.set('startDate', startDate);
        queryParams.set('endDate', endDate);
    }
    if (timezone) queryParams.set('timezone', timezone);

    return (
        <Button asChild variant="ghost" size="sm">
            <Link href={`/review/${session.siteId}?${queryParams.toString()}`}>
                {t('review')}
            </Link>
        </Button>
    );
}
