'use client';

import { useGetAllSpecimens } from '@/api/specimen/hooks/use-get-all-specimens';
import type { GetAllSpecimensQueryParams } from '@/api/specimen/validation/get-all-specimens-schema';
import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { SkeletonList } from '@/components/ui/skeleton-list';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import ImageReviewDetails from './image-review-details';

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
    collectionCycleId,
    timezone,
    onGoToPreviousStep,
    onGoToNextStep,
}: ImageReviewWorkspaceProps) {
    const t = useTranslations('ReviewImage');
    const tCommon = useTranslations('Common');
    const [specimenIndex, setSpecimenIndex] = useState(0);
    const [currentImage, setCurrentImage] = useState<SpecimenImage | null>(
        null,
    );

    const specimenQueryParams: GetAllSpecimensQueryParams =
        collectionCycleId !== undefined
            ? {
                  siteId,
                  collectionCycleId,
                  sessionType: 'SURVEILLANCE',
                  includeAllImages: true,
              }
            : {
                  siteId,
                  startDate,
                  endDate,
                  sessionType: 'SURVEILLANCE',
                  includeAllImages: true,
              };

    const { data: getAllSpecimensResult, isPending: isGetAllSpecimensPending } =
        useGetAllSpecimens(specimenQueryParams);

    if (isGetAllSpecimensPending || !getAllSpecimensResult) {
        return <SkeletonList count={1} height="xl" width="full" />;
    }

    if (!getAllSpecimensResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAllSpecimensResult.error.message}
            </p>
        );
    }

    const specimens = getAllSpecimensResult.data.specimens;

    if (specimens.length === 0) {
        return (
            <div className="space-y-4">
                <div className="bg-muted/30 flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
                    <ImageOff className="text-muted-foreground/60 mb-4 h-12 w-12" />
                    <h3 className="text-sm font-semibold">{t('emptyTitle')}</h3>
                    <p className="text-muted-foreground mt-1 max-w-md text-sm">
                        {t('emptyDescription')}
                    </p>
                </div>

                <div className="flex justify-between">
                    <Button variant="outline" onClick={onGoToPreviousStep}>
                        {tCommon('previous')}
                    </Button>
                    <Button onClick={onGoToNextStep}>
                        {t('continueToCertification')}
                    </Button>
                </div>
            </div>
        );
    }

    const totalSpecimens = specimens.length;
    const currentSpecimen = specimens[specimenIndex]!;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">
                    {t('specimenCounter', {
                        current: specimenIndex + 1,
                        total: totalSpecimens,
                    })}
                </p>
                <div className="flex gap-2">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setSpecimenIndex(index => Math.max(index - 1, 0))
                        }
                        disabled={specimenIndex === 0}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        {t('previousSpecimen')}
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                            setSpecimenIndex(index =>
                                Math.min(index + 1, totalSpecimens - 1),
                            )
                        }
                        disabled={specimenIndex === totalSpecimens - 1}
                    >
                        {t('nextSpecimen')}
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardContent className="p-4">
                        <SpecimenImageCarousel
                            key={currentSpecimen.id}
                            specimen={currentSpecimen}
                            onCurrentImageChange={setCurrentImage}
                        />
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardContent className="p-4">
                        <ImageReviewDetails
                            specimen={currentSpecimen}
                            currentImage={currentImage}
                            timezone={timezone ?? null}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onGoToPreviousStep}>
                    {tCommon('previous')}
                </Button>
                <Button onClick={onGoToNextStep}>
                    {t('continueToCertification')}
                </Button>
            </div>
        </div>
    );
}
