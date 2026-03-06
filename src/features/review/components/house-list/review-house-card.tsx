'use client';

import type { SessionState } from '@/api/session/validation/session-schema';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Home, Lock } from 'lucide-react';

interface ReviewHouseCardProps {
    siteId: number;
    houseNumber: string | undefined;
    sessionCount: number;
    state: SessionState | undefined;
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

function ActionButton({ state }: { state: SessionState | undefined }) {
    if (!state || state === 'NEEDS_REVIEW') {
        return (
            <Button size="sm" className="w-full">
                Begin Review
            </Button>
        );
    }
    if (state === 'IN_REVIEW') {
        return (
            <Button size="sm" variant="outline" className="w-full">
                Continue Review
            </Button>
        );
    }
    return (
        <Button size="sm" variant="ghost" className="w-full" disabled>
            <Lock className="mr-2 h-3.5 w-3.5" />
            Locked
        </Button>
    );
}

export default function ReviewHouseCard({
    siteId,
    houseNumber,
    sessionCount,
    state,
}: ReviewHouseCardProps) {
    return (
        <Card className="border-border/50 bg-card/50 transition-all duration-200 hover:shadow-md">
            <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                        <div className="bg-muted flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
                            <Home className="text-muted-foreground h-4 w-4" />
                        </div>
                        <div>
                            <p className="text-xs text-muted-foreground">
                                House ID
                            </p>
                            <p className="font-semibold">{siteId}</p>
                            {houseNumber && (
                                <p className="text-muted-foreground text-xs">
                                    {houseNumber}
                                </p>
                            )}
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
                        <ActionButton state={state} />
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
