'use client';

import type { Site } from '@/api/site/validation/site-schema';
import type { SessionState } from '@/api/session/validation/session-schema';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Lock, MapPin } from 'lucide-react';
import { getSiteTopLevelLocation } from '@/api/site/utils';
import Link from 'next/link';

interface ReviewSiteCardProps {
    site: Site;
    sessionCount: number;
    state?: SessionState;
}

const STATE_VARIANTS: Record<
    SessionState,
    'default' | 'destructive' | 'outline' | 'secondary'
> = {
    NEEDS_REVIEW: 'destructive',
    IN_REVIEW: 'outline',
    CERTIFIED: 'default',
    SUBMITTED: 'secondary',
    NOT_APPLICABLE: 'secondary',
};

const LOCKED_STATES: SessionState[] = [
    'CERTIFIED',
    'SUBMITTED',
    'NOT_APPLICABLE',
];

export default function ReviewSiteCard({
    site,
    sessionCount,
    state,
}: ReviewSiteCardProps) {
    const isLocked =
        sessionCount === 0 || (state && LOCKED_STATES.includes(state));

    if (isLocked) {
        return (
            <div className="cursor-not-allowed opacity-60">
                <div className="border-border/50 bg-card/50 flex items-center justify-between gap-4 rounded-lg border p-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                            <MapPin className="text-primary h-5 w-5" />
                        </div>
                        <div>
                            <p className="font-medium">
                                {site.name ??
                                    site.houseNumber ??
                                    `Site ${site.siteId}`}
                            </p>
                            <p className="text-muted-foreground text-sm">
                                {sessionCount} session
                                {sessionCount !== 1 && 's'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        {state && (
                            <Badge variant={STATE_VARIANTS[state]}>
                                {state.replaceAll('_', ' ')}
                            </Badge>
                        )}
                        <Lock className="text-muted-foreground h-4 w-4" />
                    </div>
                </div>
            </div>
        );
    }

    const topLevelLocation = getSiteTopLevelLocation(site);

    return (
        <Link href={`/review/${topLevelLocation}/${site.siteId}`}>
            <div className="border-border/50 bg-card/50 hover:bg-muted/50 flex items-center justify-between gap-4 rounded-lg border p-4 transition-colors">
                <div className="flex items-center gap-3">
                    <div className="bg-primary/10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full">
                        <MapPin className="text-primary h-5 w-5" />
                    </div>
                    <div>
                        <p className="font-medium">
                            {site.name ??
                                site.houseNumber ??
                                `Site ${site.siteId}`}
                        </p>
                        <p className="text-muted-foreground text-sm">
                            {sessionCount} session{sessionCount !== 1 && 's'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {state && (
                        <Badge variant={STATE_VARIANTS[state]}>
                            {state.replaceAll('_', ' ')}
                        </Badge>
                    )}
                    <ChevronRight className="text-muted-foreground h-4 w-4" />
                </div>
            </div>
        </Link>
    );
}
