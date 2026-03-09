'use client';

import type { Site } from '@/api/site/validation/site-schema';
import type { SessionState } from '@/api/session/validation/session-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Lock } from 'lucide-react';

interface ReviewSiteCardProps {
    site: Site;
    sessionCount: number;
    state: SessionState | undefined;
    onClick: () => void;
}

const STATE_BADGE_VARIANT: Record<
    SessionState,
    'default' | 'destructive' | 'outline' | 'secondary'
> = {
    NEEDS_REVIEW: 'destructive',
    IN_REVIEW: 'outline',
    CERTIFIED: 'default',
    SUBMITTED: 'secondary',
    NOT_APPLICABLE: 'secondary',
};

const ACTION_BUTTON_VARIANT: Record<
    SessionState,
    'default' | 'outline' | 'ghost'
> = {
    NEEDS_REVIEW: 'default',
    IN_REVIEW: 'outline',
    CERTIFIED: 'ghost',
    SUBMITTED: 'ghost',
    NOT_APPLICABLE: 'ghost',
};

export default function ReviewSiteCard({
    site,
    sessionCount,
    state,
    onClick,
}: ReviewSiteCardProps) {
    const isLocked =
        state === 'CERTIFIED' ||
        state === 'SUBMITTED' ||
        state === 'NOT_APPLICABLE';

    const buttonLabel =
        !state || state === 'NEEDS_REVIEW'
            ? 'Begin Review'
            : state === 'IN_REVIEW'
              ? 'Continue Review'
              : 'Locked';

    return (
        <Card className="border-border/50 bg-card/50 transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                            <Home className="text-muted-foreground h-4 w-4" />
                        </div>
                        <div>
                            <p className="font-semibold">
                                {site.houseNumber ?? `Site ${site.siteId}`}
                            </p>
                        </div>
                    </div>

                    {state && (
                        <Badge variant={STATE_BADGE_VARIANT[state]}>
                            {state.replaceAll('_', ' ')}
                        </Badge>
                    )}
                </div>

                <div className="mt-4 flex items-center justify-between gap-4">
                    <div>
                        <p className="text-xs text-muted-foreground">
                            Sessions
                        </p>
                        <p className="text-sm font-medium">{sessionCount}</p>
                    </div>

                    <div className="w-36">
                        <Button
                            size="sm"
                            variant={
                                isLocked
                                    ? 'ghost'
                                    : ACTION_BUTTON_VARIANT[
                                          state ?? 'NEEDS_REVIEW'
                                      ]
                            }
                            className="w-full"
                            disabled={isLocked}
                            onClick={onClick}
                        >
                            {isLocked && (
                                <Lock className="mr-2 h-3.5 w-3.5" />
                            )}
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
