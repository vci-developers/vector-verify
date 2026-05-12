'use client';

import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { usePutSessionById } from '@/api/session/hooks/use-put-session-by-id';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ErrorBanner from '@/components/ui/error-banner';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ReviewSiteDetailsHeader from './layout/review-site-details-header';
import MetadataReviewWorkspace from '../metadata-review/components/metadata-review-workspace';
import ImageReviewWorkspace from '../image-review/components/image-review-workspace';
import CertificationWorkspace from '../certification/components/certification-workspace';

const REVIEW_STEPS = [
    { label: 'Metadata Review' },
    { label: 'Image Review' },
    { label: 'Certification' },
] as const;

interface ReviewSiteDetailsPageClientProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function ReviewSiteDetailsPageClient({
    siteId,
    startDate,
    endDate,
}: ReviewSiteDetailsPageClientProps) {
    const router = useRouter();
    const [currentStepIndex, setCurrentStepIndex] = useState(0);
    const [certificationError, setCertificationError] = useState<string | null>(
        null,
    );

    const { mutateAsync: putSessionById, isPending: isUpdatingSession } =
        usePutSessionById();
    const { data: getAllSessionsResult } = useGetAllSessions({
        siteId,
        startDate,
        endDate,
    });

    const periodLabel = startDate
        ? format(new Date(startDate + 'T00:00:00'), 'MMMM yyyy')
        : 'the selected period';

    async function handleCertify() {
        setCertificationError(null);

        const sessions = getAllSessionsResult?.ok
            ? getAllSessionsResult.data.sessions
            : [];

        const results = await Promise.allSettled(
            sessions.map(session =>
                putSessionById({
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
    }

    function goToNextStep() {
        setCurrentStepIndex(index =>
            Math.min(index + 1, REVIEW_STEPS.length - 1),
        );
    }

    function goToPreviousStep() {
        setCurrentStepIndex(index => Math.max(index - 1, 0));
    }

    return (
        <PageShell
            title="Review"
            description="Review submitted session data by location."
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <div className="space-y-6">
                        <ReviewSiteDetailsHeader
                            steps={REVIEW_STEPS}
                            currentStepIndex={currentStepIndex}
                        />

                        <Separator />

                        {certificationError && currentStepIndex === 2 && (
                            <ErrorBanner message={certificationError} />
                        )}

                        {currentStepIndex === 0 && (
                            <MetadataReviewWorkspace
                                siteId={siteId}
                                startDate={startDate}
                                endDate={endDate}
                                onGoToNextStep={goToNextStep}
                            />
                        )}
                        {currentStepIndex === 1 && (
                            <ImageReviewWorkspace
                                siteId={siteId}
                                startDate={startDate}
                                endDate={endDate}
                                onGoToPreviousStep={goToPreviousStep}
                                onGoToNextStep={goToNextStep}
                            />
                        )}
                        {currentStepIndex === 2 && (
                            <CertificationWorkspace
                                periodLabel={periodLabel}
                                onGoToPreviousStep={goToPreviousStep}
                                onCertify={handleCertify}
                                isCertifying={isUpdatingSession}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </PageShell>
    );
}
