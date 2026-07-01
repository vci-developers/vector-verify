'use client';

import { useGetAllSpecimens } from '@/api/specimen/hooks/use-get-all-specimens';
import { networkErrorMessage } from '@/lib/network/network-error';
import { Button } from '@/components/ui/button';
import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { usePagination } from '@/lib/hooks/use-pagination';
import { AlertCircle, ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ImageReviewDetails from './image-review-details';
import { useGetAllSessions } from '@/api/session/hooks/use-get-all-sessions';
import { cn } from '@/utils/cn';

interface ImageReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
    collectionCycleId?: number;
    timezone?: string;
    onGoToPreviousStep: () => void;
    onGoToNextStep: () => void;
}

export default function ImageReviewWorkspace({
    siteId,
    startDate,
    endDate,
    onGoToPreviousStep,
    onGoToNextStep,
}: ImageReviewWorkspaceProps) {
    const [currentImageBeingViewed, setCurrentImageBeingViewed] =
        useState<SpecimenImage | null>(null);
    const {
        page: currentSpecimenNumber,
        nextPage: goToNextSpecimen,
        previousPage: goToPreviousSpecimen,
    } = usePagination({ limit: 1 });

    const { data: getAllSpecimensResult, isPending: isGetAllSpecimensPending } =
        useGetAllSpecimens({
            siteId,
            startDate,
            endDate,
            sessionType: 'SURVEILLANCE',
            includeAllImages: true,
        });

    const { data: getAllSessionsResult, isPending: isGetAllSessionsPending } =
        useGetAllSessions({
            siteIds: [siteId],
            startDate,
            endDate,
            type: 'SURVEILLANCE',
        });

    if (isGetAllSpecimensPending || !getAllSpecimensResult) {
        return (
            <p className="text-muted-foreground text-sm">
                Loading specimens...
            </p>
        );
    } else if (isGetAllSessionsPending || !getAllSessionsResult) {
        return (
            <p className="text-muted-foreground text-sm">Loading sessions...</p>
        );
    }

    if (!getAllSpecimensResult.ok) {
        return (
            <p className="text-destructive text-sm">
                Error loading specimens:{' '}
                {networkErrorMessage(getAllSpecimensResult.error)}
            </p>
        );
    }
    if (!getAllSessionsResult.ok) {
        return (
            <p className="text-destructive text-sm">
                Error loading sessions:{' '}
                {networkErrorMessage(getAllSessionsResult.error)}
            </p>
        );
    }

    const allSpecimensForSite = getAllSpecimensResult.data.specimens;
    const allSessionsForSite = getAllSessionsResult.data.sessions;
    const totalSpecimensUploaded = allSpecimensForSite.length;
    const expectedSpecimensCount = allSessionsForSite.reduce(
        (total, session) => total + (session.expectedSpecimens ?? 0),
        0,
    );
    const hasReliableExpectedCount =
        expectedSpecimensCount != null &&
        expectedSpecimensCount > 0 &&
        totalSpecimensUploaded <= expectedSpecimensCount;
    const specimensUploadedLabel = hasReliableExpectedCount
        ? `${totalSpecimensUploaded} of ${expectedSpecimensCount} Specimens Uploaded`
        : `${totalSpecimensUploaded} Specimens Uploaded`;
    const isMissingExpectedSpecimens =
        hasReliableExpectedCount &&
        totalSpecimensUploaded < expectedSpecimensCount;

    if (allSpecimensForSite.length === 0) {
        return (
            <div className="space-y-4">
                <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <ImageOff className="text-muted-foreground/60 mb-4 h-12 w-12" />
                    <h3 className="text-sm font-semibold">
                        No specimens to review
                    </h3>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">
                        There are no specimens for this site in the selected
                        period. You can continue to certification.
                    </p>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={onGoToPreviousStep}>
                        Back
                    </Button>
                    <Button onClick={onGoToNextStep}>
                        Continue to Certification
                    </Button>
                </div>
            </div>
        );
    }

    const totalSpecimensToReview = allSpecimensForSite.length;
    const currentSpecimenBeingReviewed =
        allSpecimensForSite[currentSpecimenNumber - 1]!;
    const isOnFirstSpecimen = currentSpecimenNumber === 1;
    const isOnLastSpecimen = currentSpecimenNumber === totalSpecimensToReview;

    function handleGoToPreviousSpecimen() {
        goToPreviousSpecimen(totalSpecimensToReview);
    }

    function handleGoToNextSpecimen() {
        goToNextSpecimen(totalSpecimensToReview);
    }

    return (
        <div className="space-y-4">
            <div
                className={cn(
                    isMissingExpectedSpecimens &&
                        'text-destructive font-medium',
                )}
            >
                {isMissingExpectedSpecimens && (
                    <AlertCircle className="h-3.5 w-3.5" />
                )}
                <p className="text-medium font-semibold">
                    {specimensUploadedLabel}
                </p>
            </div>
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                    Specimen {currentSpecimenNumber} of {totalSpecimensToReview}
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGoToPreviousSpecimen}
                        disabled={isOnFirstSpecimen}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous Specimen
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleGoToNextSpecimen}
                        disabled={isOnLastSpecimen}
                    >
                        Next Specimen
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardContent className="p-4">
                        <SpecimenImageCarousel
                            key={currentSpecimenBeingReviewed.id}
                            specimen={currentSpecimenBeingReviewed}
                            onCurrentImageChange={setCurrentImageBeingViewed}
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardContent className="p-4">
                        <ImageReviewDetails
                            specimen={currentSpecimenBeingReviewed}
                            currentImage={currentImageBeingViewed}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onGoToPreviousStep}>
                    Back
                </Button>
                <Button onClick={onGoToNextStep}>
                    Continue to Certification
                </Button>
            </div>
        </div>
    );
}
