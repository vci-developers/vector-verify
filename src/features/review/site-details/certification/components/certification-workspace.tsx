'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import { sessionKeys } from '@/api/session/session-keys';
import { Button } from '@/components/ui/button';
import { useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';

interface CertificationWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    onGoToPreviousStep: () => void;
}

export default function CertificationWorkspace({
    siteId,
    startDate,
    endDate,
    onGoToPreviousStep,
}: CertificationWorkspaceProps) {
    const router = useRouter();
    const queryClient = useQueryClient();

    const { data: getAllSessionsResult } = useGetAllSessions({
        siteId,
        startDate,
        endDate,
        type: 'SURVEILLANCE',
    });
    const { mutateAsync: putSessionById, isPending: isPutSessionByIdPending } =
        usePutSessionById();

    const sessionsToCertify = getAllSessionsResult?.ok
        ? getAllSessionsResult.data.sessions
        : [];
    const canCertify = sessionsToCertify.length > 0 && !isPutSessionByIdPending;

    async function handleCertify() {
        await Promise.allSettled(
            sessionsToCertify.map(session => 
                putSessionById({
                    sessionId: session.sessionId,
                    requestBody: { state: 'CERTIFIED' }
                })
            )
        )

        queryClient.invalidateQueries({ queryKey: sessionKeys.root })
        router.push('/review');
    }

    return (
        <div className="space-y-4">
            <p className="text-muted-foreground text-sm">
                Once certified, this site will be locked and no further changes
                can be made.
            </p>

            <div className="flex justify-between">
                <Button
                    variant="outline"
                    onClick={onGoToPreviousStep}
                    disabled={isPutSessionByIdPending}
                >
                    Back
                </Button>
                <Button onClick={handleCertify} disabled={!canCertify}>
                    {isPutSessionByIdPending ? 'Certifying...' : 'Certify Site'}
                </Button>
            </div>
        </div>
    );
}
