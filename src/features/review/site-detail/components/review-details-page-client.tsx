'use client';

import { useState } from 'react';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewSiteDetailHeader from '@/features/review/site-detail/components/layout/review-site-detail-header';
import { ClipboardList, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import SurveillanceFormReviewWorkspace from '@/features/review/site-detail/components/metadata-review/surveillance-form-review-workspace';

const REVIEW_TABS = [{ value: 'review', label: 'REVIEW' }] as const;

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
    const [currentStep, setCurrentStep] = useState(1);

    return (
        <PageShell
            title="Review"
            description="Review submitted session data by location."
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <div className="relative flex items-center">
                        <div className="flex flex-col space-y-4">
                            <Link
                                href="/review"
                                className="text-muted-foreground hover:text-foreground flex w-fit items-center gap-1 text-sm transition-colors"
                            >
                                <ChevronLeft className="h-9 w-3" />
                                Back to Sites
                            </Link>

                            <Tabs value={REVIEW_TABS[0].value}>
                                <TabsList>
                                    {REVIEW_TABS.map(tab => (
                                        <TabsTrigger
                                            key={tab.value}
                                            value={tab.value}
                                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                                        >
                                            {tab.label}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </Tabs>
                        </div>

                        <div className="absolute left-1/2 w-max -translate-x-1/2">
                            <ReviewSiteDetailHeader
                                steps={REVIEW_STEPS}
                                currentStep={currentStep}
                            />
                        </div>
                    </div>

                    <Separator />

                    <SurveillanceFormReviewWorkspace
                        siteId={siteId}
                        startDate={startDate}
                        endDate={endDate}
                        onResolved={() => setCurrentStep(step => step + 1)}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
