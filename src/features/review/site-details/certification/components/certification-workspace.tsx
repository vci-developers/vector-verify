'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import { sessionKeys } from '@/api/session/session-keys';
import type { GetAllSessionsQueryParams } from '@/api/session/validation/get-all-sessions-schema';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Lock, ShieldAlert } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

interface CertificationWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    collectionCycleId?: number;
    timezone?: string;
    onGoToPreviousStep: () => void;
}

export default function CertificationWorkspace({
    siteId,
    startDate,
    endDate,
    collectionCycleId,
    onGoToPreviousStep,
}: CertificationWorkspaceProps) {
    const router = useRouter();
    const queryClient = useQueryClient();
    const [hasAcknowledged, setHasAcknowledged] = useState(false);

    const sessionQueryParams: GetAllSessionsQueryParams =
        collectionCycleId !== undefined
            ? {
                  siteIds: [siteId],
                  collectionCycleId,
                  type: 'SURVEILLANCE',
              }
            : {
                  siteIds: [siteId],
                  startDate,
                  endDate,
                  type: 'SURVEILLANCE',
              };

    const { data: getAllSessionsResult } =
        useGetAllSessions(sessionQueryParams);
    const { mutateAsync: putSessionById, isPending: isPutSessionByIdPending } =
        usePutSessionById();

    const sessionsToCertify = getAllSessionsResult?.ok
        ? getAllSessionsResult.data.sessions
        : [];
    const sessionCount = sessionsToCertify.length;
    const periodLabel = startDate
        ? format(new Date(`${startDate}T00:00:00`), 'MMMM yyyy')
        : 'the selected period';
    const sessionCountLabel = `${sessionCount} session${sessionCount === 1 ? '' : 's'}`;

    const canCertify =
        sessionCount > 0 && hasAcknowledged && !isPutSessionByIdPending;

    async function handleCertify() {
        await Promise.allSettled(
            sessionsToCertify.map(session =>
                putSessionById({
                    sessionId: session.sessionId,
                    requestBody: { state: 'CERTIFIED' },
                }),
            ),
        );

        queryClient.invalidateQueries({ queryKey: sessionKeys.root });
        router.push('/review');
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-semibold">Certify Site Data</h2>
                <p className="text-muted-foreground mt-1 text-sm">
                    You are about to certify {sessionCountLabel} for{' '}
                    {periodLabel}. This action is permanent.
                </p>
            </div>

            <div className="border-warning/40 bg-warning/5 rounded-lg border p-4">
                <div className="flex gap-3">
                    <ShieldAlert className="text-warning-foreground mt-0.5 h-5 w-5 shrink-0" />
                    <div className="space-y-3">
                        <div>
                            <p className="text-sm font-semibold">
                                You are taking responsibility for this data
                            </p>
                            <p className="text-muted-foreground mt-1 flex items-center gap-1.5 text-xs">
                                <Lock className="h-3 w-3" />
                                Once certified, this data will be locked. No
                                further changes can be made.
                            </p>
                        </div>
                        <div>
                            <p className="text-xs font-medium">
                                By certifying, you confirm:
                            </p>
                            <ul className="text-muted-foreground mt-1 list-disc space-y-1 pl-5 text-xs">
                                <li>
                                    All surveillance form discrepancies have
                                    been resolved
                                </li>
                                <li>All specimen images have been reviewed</li>
                                <li>
                                    The data is complete and accurate to the
                                    best of your knowledge
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex items-start gap-3">
                <Checkbox
                    id="certify-confirm"
                    checked={hasAcknowledged}
                    onCheckedChange={checked =>
                        setHasAcknowledged(checked === true)
                    }
                    disabled={isPutSessionByIdPending}
                    className="mt-0.5"
                />
                <Label
                    htmlFor="certify-confirm"
                    className="cursor-pointer text-sm leading-relaxed"
                >
                    I have reviewed the data and take responsibility for
                    certifying it as accurate.
                </Label>
            </div>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onGoToPreviousStep}
                    disabled={isPutSessionByIdPending}
                >
                    Back
                </Button>
                <Button onClick={handleCertify} disabled={!canCertify}>
                    {isPutSessionByIdPending
                        ? 'Certifying...'
                        : `Certify ${sessionCountLabel}`}
                </Button>
            </div>
        </div>
    );
}
