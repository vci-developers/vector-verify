'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import ReviewSiteDetailHeader from '@/features/review/components/site-detail/review-site-detail-header';
import SurveillanceFormReviewWorkspace from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-workspace';
import { ClipboardList } from 'lucide-react';

const REVIEW_STEPS = [
    { label: 'Form Comparison' },
    { label: 'Image Review' },
    { label: 'Certification' },
];

interface ReviewDetailsPageClientProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
}

export default function ReviewDetailsPageClient({
    siteId,
    startDate,
    endDate,
}: ReviewDetailsPageClientProps) {
    return (
        <PageShell
            title="Review"
            description="Review submitted session data by district and month."
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <ReviewSiteDetailHeader
                        steps={REVIEW_STEPS}
                        currentStep={1}
                    />
                </CardContent>
            </Card>

            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <SurveillanceFormReviewWorkspace
                        siteId={siteId}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
