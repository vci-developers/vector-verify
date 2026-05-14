'use client';

import { useGetAllSpecimens } from '@/api/specimen/hooks/use-get-all-specimens';
import { networkErrorMessage } from '@/lib/network/network-error';
import { Button } from '@/components/ui/button';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { getSpecimenImageCarouselItems } from '@/lib/specimen/specimen-image-carousel-items';
import { usePagination } from '@/lib/hooks/use-pagination';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import ImageReviewDetails from './image-review-details';

interface ImageReviewWorkspaceProps {
    siteId: number;
    startDate?: string;
    endDate?: string;
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
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
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

    if (isGetAllSpecimensPending || !getAllSpecimensResult) {
        return (
            <p className="text-muted-foreground text-sm">
                Loading specimens...
            </p>
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

    const allSpecimensForSite = getAllSpecimensResult.data.specimens;

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
    const orderedImagesForCurrentSpecimen = getSpecimenImageCarouselItems(
        currentSpecimenBeingReviewed,
    );
    const activeImageIndex =
        orderedImagesForCurrentSpecimen.length > 0
            ? Math.min(
                  currentImageIndex,
                  orderedImagesForCurrentSpecimen.length - 1,
              )
            : 0;
    const currentImageBeingViewed =
        orderedImagesForCurrentSpecimen[activeImageIndex] ?? null;
    const isOnFirstSpecimen = currentSpecimenNumber === 1;
    const isOnLastSpecimen = currentSpecimenNumber === totalSpecimensToReview;

    function handleGoToPreviousSpecimen() {
        setCurrentImageIndex(0);
        goToPreviousSpecimen(totalSpecimensToReview);
    }

    function handleGoToNextSpecimen() {
        setCurrentImageIndex(0);
        goToNextSpecimen(totalSpecimensToReview);
    }

    return (
        <div className="space-y-4">
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
                            specimenId={currentSpecimenBeingReviewed.specimenId}
                            images={orderedImagesForCurrentSpecimen}
                            currentImageIndex={activeImageIndex}
                            onCurrentImageIndexChange={setCurrentImageIndex}
                            emptyLabel="No image has been uploaded for this specimen."
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
