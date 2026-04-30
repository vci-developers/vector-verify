'use client';

import PageShell from '@/components/layout/page-shell';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewSiteDetailHeader from '@/features/review/components/site-detail/review-site-detail-header';
import SpecimenImageReviewWorkspace from '@/features/review/components/site-detail/specimen-image-review/specimen-image-review-workspace';
import SurveillanceFormReviewWorkspace from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-workspace';
import { ClipboardList, ChevronLeft, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const REVIEW_TABS = [{ value: 'review', label: 'REVIEW' }] as const;

const REVIEW_STEPS = [
    { label: 'Form Comparison' },
    { label: 'Image Review' },
    { label: 'Certification' },
];

const LAST_IMPLEMENTED_REVIEW_STEP = 2;

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

    function showPreviousStep() {
        setCurrentStep(step => Math.max(step - 1, 1));
    }

    function showNextStep() {
        setCurrentStep(step =>
            Math.min(step + 1, LAST_IMPLEMENTED_REVIEW_STEP),
        );
    }

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

                    {currentStep === 1 && (
                        <SurveillanceFormReviewWorkspace
                            siteId={siteId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}

                    {currentStep === 2 && (
                        <SpecimenImageReviewWorkspace
                            siteId={siteId}
                            startDate={startDate}
                            endDate={endDate}
                        />
                    )}

                    <Separator />

                    <div className="flex items-center justify-between">
                        <Button
                            type="button"
                            variant="outline"
                            size="lg"
                            onClick={showPreviousStep}
                            disabled={currentStep === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            type="button"
                            size="lg"
                            onClick={showNextStep}
                            disabled={
                                currentStep === LAST_IMPLEMENTED_REVIEW_STEP
                            }
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </PageShell>
    );
}
