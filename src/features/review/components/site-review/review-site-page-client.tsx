'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useUpdateSession } from '@/api/session/hooks/use-update-session';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ReviewStepIndicator from '@/features/review/components/site-review/review-step-indicator';
import ReviewCertificationStep from '@/features/review/components/site-review/review-certification-step';
import { ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';

interface ReviewSitePageClientProps {
    siteId: number;
    startDate: string;
    endDate: string;
}

export default function ReviewSitePageClient({
    siteId,
    startDate,
    endDate,
}: ReviewSitePageClientProps) {
    const router = useRouter();
    const { mutateAsync: updateSession, isPending: isUpdatingSession } =
        useUpdateSession();

    const { data: getSessionsResult, isPending: isGetSessionsPending } =
        useGetSessions({ siteId, startDate, endDate });

    if (isGetSessionsPending || !getSessionsResult) {
        return (
            <PageShell
                title="Review"
                description="Loading site data..."
                icon={ClipboardCheck}
            >
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <div className="flex justify-center py-12">
                            <p className="text-muted-foreground text-sm">
                                Loading...
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    if (!getSessionsResult.ok) {
        return (
            <PageShell
                title="Review"
                description="Error loading site data"
                icon={ClipboardCheck}
            >
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <p className="text-destructive text-sm">
                            {getSessionsResult.error.message}
                        </p>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    const sessions = getSessionsResult.data.sessions;
    const houseNumber = sessions[0]?.site?.houseNumber ?? `Site ${siteId}`;
    const formattedMonth = format(
        new Date(startDate + 'T00:00:00'),
        'MMMM yyyy',
    );

    const handleCertify = async () => {
        const results = await Promise.allSettled(
            sessions.map(session =>
                updateSession({
                    sessionId: session.sessionId,
                    requestBody: { state: 'CERTIFIED' },
                }),
            ),
        );

        const allSucceeded = results.every(
            r => r.status === 'fulfilled' && r.value.ok,
        );

        if (allSucceeded) {
            router.push('/review');
        }
    };

    return (
        <PageShell
            title={`Review - House ${houseNumber}`}
            description={`${formattedMonth} Certification Workflow`}
            icon={ClipboardCheck}
            headerAction={
                <Link
                    href="/review"
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm transition-colors"
                >
                    ← Back to List
                </Link>
            }
        >
            <div className="space-y-6">
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <ReviewStepIndicator currentStep={3} />
                    </CardContent>
                </Card>

                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <ReviewCertificationStep
                            houseNumber={houseNumber}
                            startDate={startDate}
                            onBack={() => router.push('/review')}
                            onCertify={handleCertify}
                            isCertifying={isUpdatingSession}
                        />
                    </CardContent>
                </Card>
            </div>
        </PageShell>
    );
}
