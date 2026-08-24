'use client';

import { useGetAllSpecimens } from '@/api/specimen/hooks/use-get-all-specimens';
import type { GetAllSpecimensQueryParams } from '@/api/specimen/validation/get-all-specimens-schema';
import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import SpecimenImageCarousel from '@/components/specimen/specimen-image-carousel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronLeft, ChevronRight, ImageOff } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Fragment, useState } from 'react';
import ImageReviewDetails from './image-review-details';
import type { Session } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { getSiteLabelParts } from '@/features/review/dhis2-sync/utils/get-site-label-parts';
import MissingSpecimensTooltip from './missing-specimens-tooltip';
import { Skeleton } from '@/components/ui/skeleton';
import ErrorBanner from '@/components/ui/error-banner';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import type { NetworkError } from '@/lib/network/network-error';

interface ImageReviewWorkspaceProps {
    site: Site;
    sessions: Session[];
    startDate?: string;
    endDate?: string;
    collectionCycleId?: number;
    timezone?: string;
    onGoToPreviousStep: () => void;
    onGoToNextStep: () => void;
}

type SpecimensState =
    | { status: 'loading' }
    | { status: 'error'; error: NetworkError }
    | { status: 'success'; specimens: Specimen[] };

export default function ImageReviewWorkspace({
    site,
    sessions,
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
                  siteId: site.siteId,
                  collectionCycleId,
                  sessionType: 'SURVEILLANCE',
                  includeAllImages: true,
              }
            : {
                  siteId: site.siteId,
                  startDate,
                  endDate,
                  sessionType: 'SURVEILLANCE',
                  includeAllImages: true,
              };

    const { data: getAllSpecimensResult, isPending: isGetAllSpecimensPending } =
        useGetAllSpecimens(specimenQueryParams);

    const specimensState: SpecimensState =
        isGetAllSpecimensPending || !getAllSpecimensResult
            ? { status: 'loading' }
            : !getAllSpecimensResult.ok
              ? { status: 'error', error: getAllSpecimensResult.error }
              : {
                    status: 'success',
                    specimens: getAllSpecimensResult.data.specimens,
                };

    const expectedSpecimensCount = sessions.reduce(
        (total, session) => total + (session.expectedSpecimens ?? 0),
        0,
    );

    const siteLabel = getSiteLabelParts(site).primaryLabel;

    const skeletonVariant =
        specimensState.status === 'error' ? 'destructive' : 'default';

    if (
        specimensState.status === 'success' &&
        specimensState.specimens.length === 0
    ) {
        return (
            <div className="space-y-4">
                <MissingSpecimensTooltip
                    specimensMissing={expectedSpecimensCount}
                    siteLabel={siteLabel}
                />
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
    const currentSpecimen =
        specimensState.status === 'success'
            ? specimensState.specimens[specimenIndex]
            : undefined;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    {specimensState.status === 'success' ? (
                        <p className="text-sm font-semibold">
                            {t('specimenCounter', {
                                current: specimenIndex + 1,
                                total: specimensState.specimens.length,
                            })}
                        </p>
                    ) : (
                        <Skeleton
                            height="md"
                            width="lg"
                            variant={skeletonVariant}
                        />
                    )}
                    {specimensState.status === 'success' && (
                        <MissingSpecimensTooltip
                            specimensMissing={
                                expectedSpecimensCount -
                                specimensState.specimens.length
                            }
                            siteLabel={siteLabel}
                        />
                    )}
                </div>
                {specimensState.status === 'success' && (
                    <div className="flex gap-2">
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() =>
                                setSpecimenIndex(index =>
                                    Math.max(index - 1, 0),
                                )
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
                                    Math.min(
                                        index + 1,
                                        specimensState.specimens.length - 1,
                                    ),
                                )
                            }
                            disabled={
                                specimenIndex ===
                                specimensState.specimens.length - 1
                            }
                        >
                            {t('nextSpecimen')}
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                )}
            </div>
            {specimensState.status === 'error' && (
                <ErrorBanner
                    message={
                        specimensState.error.message || t('specimensError')
                    }
                />
            )}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-5">
                <Card className="lg:col-span-3">
                    <CardContent className="space-y-4 p-4">
                        {specimensState.status === 'success' &&
                        currentSpecimen ? (
                            <SpecimenImageCarousel
                                key={currentSpecimen.id}
                                specimen={currentSpecimen}
                                onCurrentImageChange={setCurrentImage}
                            />
                        ) : (
                            <Fragment>
                                <Skeleton
                                    className="aspect-4/3 w-full rounded-lg"
                                    variant={skeletonVariant}
                                />
                                <Skeleton
                                    height="sm"
                                    width="lg"
                                    variant={skeletonVariant}
                                />
                            </Fragment>
                        )}
                    </CardContent>
                </Card>
                <Card className="lg:col-span-2">
                    <CardContent className="p-4">
                        <ImageReviewDetails
                            currentImage={currentImage}
                            timezone={timezone ?? null}
                            state={
                                specimensState.status !== 'success'
                                    ? { status: specimensState.status }
                                    : currentSpecimen && currentImage
                                      ? {
                                            status: 'success',
                                            specimen: currentSpecimen,
                                        }
                                      : { status: 'loading' }
                            }
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="flex justify-between">
                <Button variant="outline" onClick={onGoToPreviousStep}>
                    {tCommon('previous')}
                </Button>
                <Button
                    onClick={onGoToNextStep}
                    disabled={specimensState.status !== 'success'}
                >
                    {t('continueToCertification')}
                </Button>
            </div>
        </div>
    );
}
