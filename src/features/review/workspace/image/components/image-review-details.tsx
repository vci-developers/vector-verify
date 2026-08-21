import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ConfidencePredictionRow from '@/features/review/workspace/image/components/confidence-prediction-row';
import { Skeleton } from '@/components/ui/skeleton';
import { Fragment } from 'react/jsx-runtime';

type DetailsState =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'success'; specimen: Specimen };

interface ImageReviewDetailsProps {
    currentImage: SpecimenImage | null;
    timezone: string | null;
    state: DetailsState;
}

export default function ImageReviewDetails({
    currentImage,
    timezone,
    state,
}: ImageReviewDetailsProps) {
    const t = useTranslations('ReviewImage');

    const totalImagesUploaded =
        state.status === 'success' ? state.specimen.images?.length : undefined;
    const expectedImagesCount =
        state.status === 'success' ? state.specimen.expectedImages : undefined;

    const hasReliableExpectedCount =
        expectedImagesCount != null &&
        totalImagesUploaded != null &&
        expectedImagesCount > 0 &&
        totalImagesUploaded <= expectedImagesCount;

    const imagesCapturedLabel = hasReliableExpectedCount
        ? `${totalImagesUploaded} / ${expectedImagesCount}`
        : !totalImagesUploaded
          ? '—'
          : `${totalImagesUploaded}`;
    const isMissingExpectedImages =
        hasReliableExpectedCount && totalImagesUploaded < expectedImagesCount;

    const capturedAtLabel = currentImage?.capturedAt
        ? formatDateInTimezone(
              currentImage.capturedAt,
              timezone,
              'MMM d, yyyy h:mm a',
          )
        : '—';
    const submittedAtLabel = currentImage?.submittedAt
        ? formatDateInTimezone(
              currentImage.submittedAt,
              timezone,
              'MMM d, yyyy h:mm a',
          )
        : '—';

    function getMaxConfidencePercentage(
        logits: number[] | undefined,
    ): number | null {
        if (!logits || logits.length === 0) {
            return null;
        }
        const exps = logits.map(x => Math.exp(x));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return Math.round(Math.max(...exps.map(x => x / sumExps)) * 1000) / 10;
    }

    const modelConfidencePercentages = {
        species: currentImage?.species
            ? getMaxConfidencePercentage(
                  currentImage?.inferenceResult?.speciesLogits,
              )
            : null,
        sex: currentImage?.sex
            ? getMaxConfidencePercentage(
                  currentImage?.inferenceResult?.sexLogits,
              )
            : null,
        abdomenStatus: currentImage?.abdomenStatus
            ? getMaxConfidencePercentage(
                  currentImage?.inferenceResult?.abdomenStatusLogits,
              )
            : null,
    };

    const isEmpty =
        state.status === 'success' &&
        (totalImagesUploaded == null || totalImagesUploaded <= 0);

    const skeletonVariant =
        state.status === 'error' ? 'destructive' : 'default';

    return (
        <div className="space-y-4">
            <div>
                <p className="text-muted-foreground text-sm uppercase">
                    {t('specimenId')}
                </p>
                {state.status === 'success' ? (
                    <p className="text-lg font-semibold">
                        {state.specimen.specimenId}
                    </p>
                ) : (
                    <Skeleton
                        height="md"
                        width="md"
                        variant={skeletonVariant}
                    />
                )}
            </div>

            <Separator />

            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t('sessionId')}</dt>
                <dd>
                    {state.status === 'success' ? (
                        state.specimen.sessionId
                    ) : (
                        <Skeleton
                            height="sm"
                            width="sm"
                            variant={skeletonVariant}
                        />
                    )}
                </dd>

                <dt className="text-muted-foreground">{t('imagesCaptured')}</dt>
                <dd
                    className={cn(
                        'flex items-center gap-1',
                        isMissingExpectedImages &&
                            'text-destructive font-medium',
                    )}
                >
                    {state.status === 'success' ? (
                        <Fragment>
                            {isMissingExpectedImages && (
                                <AlertCircle className="h-3.5 w-3.5" />
                            )}
                            {imagesCapturedLabel}
                        </Fragment>
                    ) : (
                        <Skeleton
                            height="sm"
                            width="sm"
                            variant={skeletonVariant}
                        />
                    )}
                </dd>

                <dt className="text-muted-foreground">
                    {t('needsFurtherProcessing')}
                </dt>
                <dd>
                    {state.status === 'success' ? (
                        <Badge
                            variant={
                                state.specimen.shouldProcessFurther
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {state.specimen.shouldProcessFurther
                                ? t('yes')
                                : t('no')}
                        </Badge>
                    ) : (
                        <Skeleton
                            height="sm"
                            width="sm"
                            variant={skeletonVariant}
                        />
                    )}
                </dd>
            </dl>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">{t('currentImage')}</p>
                {isEmpty ? (
                    <p className="text-muted-foreground text-sm">
                        {t('noImagesUploaded')}
                    </p>
                ) : (
                    <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                        <dt className="text-muted-foreground">
                            {t('capturedAt')}
                        </dt>
                        <dd>
                            {state.status === 'success' ? (
                                capturedAtLabel
                            ) : (
                                <Skeleton
                                    height="sm"
                                    width="lg"
                                    variant={skeletonVariant}
                                />
                            )}
                        </dd>

                        <dt className="text-muted-foreground">
                            {t('submittedAt')}
                        </dt>
                        <dd>
                            {state.status === 'success' ? (
                                submittedAtLabel
                            ) : (
                                <Skeleton
                                    height="sm"
                                    width="lg"
                                    variant={skeletonVariant}
                                />
                            )}
                        </dd>
                    </dl>
                )}
            </div>

            {!isEmpty && (
                <Fragment>
                    <Separator />

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">
                            {t('modelPredictions')}
                        </p>
                        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                            <dt className="text-muted-foreground">
                                {t('species')}
                            </dt>
                            <dd>
                                {state.status === 'success' ? (
                                    (currentImage?.species ?? '—')
                                ) : (
                                    <Skeleton
                                        height="sm"
                                        width="sm"
                                        variant={skeletonVariant}
                                    />
                                )}
                            </dd>

                            <dt className="text-muted-foreground">
                                {t('sex')}
                            </dt>
                            <dd>
                                {state.status === 'success' ? (
                                    (currentImage?.sex ?? '—')
                                ) : (
                                    <Skeleton
                                        height="sm"
                                        width="sm"
                                        variant={skeletonVariant}
                                    />
                                )}
                            </dd>

                            <dt className="text-muted-foreground">
                                {t('abdomenStatus')}
                            </dt>
                            <dd>
                                {state.status === 'success' ? (
                                    (currentImage?.abdomenStatus ?? '—')
                                ) : (
                                    <Skeleton
                                        height="sm"
                                        width="sm"
                                        variant={skeletonVariant}
                                    />
                                )}
                            </dd>
                        </dl>
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">
                            {t('modelConfidence')}
                        </p>
                        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                            <ConfidencePredictionRow
                                category={t('species')}
                                label={currentImage?.species}
                                confidencePercentage={
                                    modelConfidencePercentages.species
                                }
                                status={state.status}
                            />

                            <ConfidencePredictionRow
                                category={t('sex')}
                                label={currentImage?.sex}
                                confidencePercentage={
                                    modelConfidencePercentages.sex
                                }
                                status={state.status}
                            />

                            <ConfidencePredictionRow
                                category={t('abdomenStatus')}
                                label={currentImage?.abdomenStatus}
                                confidencePercentage={
                                    modelConfidencePercentages.abdomenStatus
                                }
                                status={state.status}
                            />
                        </dl>
                    </div>
                </Fragment>
            )}
        </div>
    );
}
