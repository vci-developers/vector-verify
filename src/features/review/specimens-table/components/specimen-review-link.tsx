'use client';

import Link from 'next/link';
import type { Session } from '@/api/session/validation/session-schema';
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
    specimenId: number;
    hasCollectionCycles: boolean;
    timezone?: string;
}
export default function SpecimenReviewLink({
    session,
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
    if (isUnassigned)
        return (
            <Tooltip>
                <TooltipTrigger asChild>
                    <span tabIndex={0}>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground"
                            disabled
                        >
                            {t('review')}
                        </Button>
                    </span>
                </TooltipTrigger>
                <TooltipContent>{t('missingCycle')}</TooltipContent>
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
        <Link
            href={`/review/${session.siteId}?${queryParams.toString()}`}
            className="text-primary hover:underline"
        >
            {t('review')}
        </Link>
    );
}
