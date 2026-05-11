'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
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
    const [currentStepIndex, setCurrentStepIndex] = useState(0);

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
                                onGoToPreviousStep={goToPreviousStep}
                                onGoToNextStep={goToNextStep}
                            />
                        )}
                        {currentStepIndex === 2 && (
                            <CertificationWorkspace
                                onGoToPreviousStep={goToPreviousStep}
                            />
                        )}
                    </div>
                </CardContent>
            </Card>
        </PageShell>
    );
}
