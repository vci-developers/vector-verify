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

interface ImageReviewDetailsProps {
    specimen: Specimen | undefined;
    currentImage: SpecimenImage | null;
    timezone: string | null;
}

export default function ImageReviewDetails({
    specimen,
    currentImage,
    timezone,
}: ImageReviewDetailsProps) {
    const t = useTranslations('ReviewImage');

    const totalImagesUploaded = specimen?.images?.length;
    const expectedImagesCount = specimen?.expectedImages;

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

    const hasImages = totalImagesUploaded != null && totalImagesUploaded > 0;
    const isLoading = !specimen || (!currentImage && hasImages);
    const isEmpty = !isLoading && !hasImages;

    return (
        <div className="space-y-4">
            <div>
                <p className="text-muted-foreground text-sm uppercase">
                    {t('specimenId')}
                </p>
                {isLoading ? (
                    <Skeleton height="md" width="md" />
                ) : (
                    <p className="text-lg font-semibold">
                        {specimen.specimenId}
                    </p>
                )}
            </div>

            <Separator />

            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t('sessionId')}</dt>
                <dd>
                    {isLoading ? (
                        <Skeleton height="sm" width="sm" />
                    ) : (
                        specimen.sessionId
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
                    {isLoading ? (
                        <Skeleton height="sm" width="sm" />
                    ) : (
                        <Fragment>
                            {isMissingExpectedImages && (
                                <AlertCircle className="h-3.5 w-3.5" />
                            )}
                            {imagesCapturedLabel}
                        </Fragment>
                    )}
                </dd>

                <dt className="text-muted-foreground">
                    {t('needsFurtherProcessing')}
                </dt>
                <dd>
                    {isLoading ? (
                        <Skeleton height="sm" width="sm" />
                    ) : (
                        <Badge
                            variant={
                                specimen?.shouldProcessFurther
                                    ? 'default'
                                    : 'secondary'
                            }
                        >
                            {specimen?.shouldProcessFurther
                                ? t('yes')
                                : t('no')}
                        </Badge>
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
                            {isLoading ? (
                                <Skeleton height="sm" width="lg" />
                            ) : (
                                capturedAtLabel
                            )}
                        </dd>

                        <dt className="text-muted-foreground">
                            {t('submittedAt')}
                        </dt>
                        <dd>
                            {isLoading ? (
                                <Skeleton height="sm" width="lg" />
                            ) : (
                                submittedAtLabel
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
                                {isLoading ? (
                                    <Skeleton height="sm" width="sm" />
                                ) : (
                                    (currentImage?.species ?? '—')
                                )}
                            </dd>

                            <dt className="text-muted-foreground">
                                {t('sex')}
                            </dt>
                            <dd>
                                {isLoading ? (
                                    <Skeleton height="sm" width="sm" />
                                ) : (
                                    (currentImage?.sex ?? '—')
                                )}
                            </dd>

                            <dt className="text-muted-foreground">
                                {t('abdomenStatus')}
                            </dt>
                            <dd>
                                {isLoading ? (
                                    <Skeleton height="sm" width="sm" />
                                ) : (
                                    (currentImage?.abdomenStatus ?? '—')
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
                                isLoading={isLoading}
                            />

                            <ConfidencePredictionRow
                                category={t('sex')}
                                label={currentImage?.sex}
                                confidencePercentage={
                                    modelConfidencePercentages.sex
                                }
                                isLoading={isLoading}
                            />

                            <ConfidencePredictionRow
                                category={t('abdomenStatus')}
                                label={currentImage?.abdomenStatus}
                                confidencePercentage={
                                    modelConfidencePercentages.abdomenStatus
                                }
                                isLoading={isLoading}
                            />
                        </dl>
                    </div>
                </Fragment>
            )}
        </div>
    );
}
