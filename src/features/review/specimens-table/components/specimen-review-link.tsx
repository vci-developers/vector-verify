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
import { buildReviewUnitHref } from '../utils/build-review-unit-href';

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
    return (
        <Link
            href={buildReviewUnitHref(session, { timezone, specimenId })}
            className="text-primary hover:underline"
        >
            {t('review')}
        </Link>
    );
}
