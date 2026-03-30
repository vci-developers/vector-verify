'use client';

import { useGetSessions } from '@/api/session/hooks/use-get-sessions';
import { useUpdateSession } from '@/api/session/hooks/use-update-session';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ErrorBanner from '@/components/ui/error-banner';
import ReviewStepIndicator from '@/features/review/components/site-review/review-step-indicator';
import ReviewCertificationStep from '@/features/review/components/site-review/review-certification-step';
import { ClipboardCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { format } from 'date-fns';
import Link from 'next/link';
import { useState } from 'react';

interface ReviewSitePageClientProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function ReviewSitePageClient({
    siteId,
    startDate,
    endDate,
}: ReviewSitePageClientProps) {
    const router = useRouter();
    const [certificationError, setCertificationError] = useState<string | null>(
        null,
    );
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
    const periodLabel = startDate
        ? format(new Date(startDate + 'T00:00:00'), 'MMMM yyyy')
        : 'the selected period';
    const workflowDescription = startDate
        ? `${periodLabel} Certification Workflow`
        : 'Certification Workflow';

    if (sessions.length === 0) {
        return (
            <PageShell
                title={`Review - Site ${siteId}`}
                description={workflowDescription}
                icon={ClipboardCheck}
            >
                <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                    <CardContent className="p-6">
                        <p className="text-muted-foreground text-sm">
                            No sessions were found for this site in{' '}
                            {periodLabel}. Certification cannot be completed
                            until reviewable sessions exist.
                        </p>
                    </CardContent>
                </Card>
            </PageShell>
        );
    }

    const handleCertify = async () => {
        setCertificationError(null);

        const results = await Promise.allSettled(
            sessions.map(session =>
                updateSession({
                    sessionId: session.sessionId,
                    requestBody: { state: 'CERTIFIED' },
                }),
            ),
        );

        const failedMessages = results.flatMap(result => {
            if (result.status === 'rejected') {
                return ['Unable to certify one or more sessions.'];
            }

            if (!result.value.ok) {
                return [result.value.error.message];
            }

            return [];
        });

        if (failedMessages.length > 0) {
            setCertificationError(
                failedMessages[0] ??
                    'Some sessions could not be certified. Please try again.',
            );
            return;
        }

        router.push('/review');
    };

    return (
        <PageShell
            title={`Review - House ${houseNumber}`}
            description={workflowDescription}
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
                        {certificationError && (
                            <div className="mb-4">
                                <ErrorBanner message={certificationError} />
                            </div>
                        )}
                        <ReviewCertificationStep
                            periodLabel={periodLabel}
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
