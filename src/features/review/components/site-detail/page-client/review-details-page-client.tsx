'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReviewSiteDetailHeader from '@/features/review/components/site-detail/review-site-detail-header';
import SurveillanceFormReviewWorkspace from '@/features/review/components/site-detail/surveillance-form-review/surveillance-form-review-workspace';
import { Button } from '@/components/ui/button';
import { ClipboardList, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';

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
    const searchParams = useSearchParams();
    const router = useRouter();

    const rawStep = Number(searchParams.get('step') ?? '1');
    const currentStep =
        Number.isFinite(rawStep) &&
        rawStep >= 1 &&
        rawStep <= REVIEW_STEPS.length
            ? rawStep
            : 1;

    function handleStepSuccess() {
        const params = new URLSearchParams(searchParams.toString());
        params.set('step', String(currentStep + 1));
        router.replace(`?${params.toString()}`);
    }

    function renderStep() {
        if (currentStep === 1) {
            return (
                <SurveillanceFormReviewWorkspace
                    siteId={siteId}
                    startDate={startDate}
                    endDate={endDate}
                    onSuccess={handleStepSuccess}
                />
            );
        }
        if (currentStep === 2) {
            return <ImageReviewPlaceholder onSuccess={handleStepSuccess} />;
        }
        return <CertificationPlaceholder />;
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

                    {renderStep()}
                </CardContent>
            </Card>
        </PageShell>
    );
}

function ImageReviewPlaceholder({ onSuccess }: { onSuccess: () => void }) {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Step 2: Image Review</h2>
                <p className="text-muted-foreground text-sm">
                    Image review is not yet implemented.
                </p>
            </div>
            <div className="flex justify-end">
                <Button onClick={onSuccess}>Continue to Certification</Button>
            </div>
        </div>
    );
}

function CertificationPlaceholder() {
    return (
        <div className="space-y-4">
            <div>
                <h2 className="text-lg font-semibold">Step 3: Certification</h2>
                <p className="text-muted-foreground text-sm">
                    Certification is not yet implemented.
                </p>
            </div>
        </div>
    );
}
