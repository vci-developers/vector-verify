import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/utils/cn';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { AlertCircle, Pencil } from 'lucide-react';
import { useTranslations } from 'next-intl';
import ConfidencePredictionRow from '@/features/review/workspace/image/components/confidence-prediction-row';
import { Skeleton } from '@/components/ui/skeleton';
import { Fragment } from 'react/jsx-runtime';
import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import PredictionRow from '@/features/review/workspace/image/components/prediction-row';
import PredictionEditForm from '@/features/review/workspace/image/components/prediction-edit-form';
import { isThumbnailImage } from '@/lib/specimen/is-thumbnail-image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

type DetailsState =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'success'; specimen: Specimen };

interface ImageReviewDetailsProps {
    currentImage: SpecimenImage | null;
    latestEditLog: ReviewLog | undefined;
    timezone: string | null;
    readOnly: boolean;
    state: DetailsState;
}

export default function ImageReviewDetails({
    currentImage,
    latestEditLog,
    timezone,
    readOnly,
    state,
}: ImageReviewDetailsProps) {
    const t = useTranslations('ReviewImage');
    const [isEditing, setIsEditing] = useState(false);

    const isCurrentImageThumbnail =
        state.status === 'success' &&
        currentImage !== null &&
        isThumbnailImage(state.specimen, currentImage);

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

    const isEdited = latestEditLog !== undefined;
    const editorName = latestEditLog?.performedBy
        ? (latestEditLog.performedBy.name ??
          t('unknownUser', { userId: latestEditLog.performedBy.userId }))
        : null;
    const canEdit = !readOnly && state.status === 'success';

    function getPrediction(
        value: string | null | undefined,
        originalValue: string | null | undefined,
        logits: number[] | undefined,
    ) {
        const modelValue = originalValue || value || null;
        return {
            value: value || null,
            originalValue: originalValue || null,
            modelValue,
            confidencePercentage: modelValue
                ? getMaxConfidencePercentage(logits)
                : null,
        };
    }

    const predictions = {
        species: getPrediction(
            currentImage?.species,
            currentImage?.appSpecies,
            currentImage?.inferenceResult?.speciesLogits,
        ),
        sex: getPrediction(
            currentImage?.sex,
            currentImage?.appSex,
            currentImage?.inferenceResult?.sexLogits,
        ),
        abdomenStatus: getPrediction(
            currentImage?.abdomenStatus,
            currentImage?.appAbdomenStatus,
            currentImage?.inferenceResult?.abdomenStatusLogits,
        ),
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
                        <div>
                            <div className="flex items-center gap-2">
                                <p className="text-sm font-semibold">
                                    {isEdited
                                        ? t('editedPredictions')
                                        : t('modelPredictions')}
                                </p>
                                {isEdited && (
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <AlertCircle className="text-warning h-4 w-4" />
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            {t('editedTooltip')}
                                        </TooltipContent>
                                    </Tooltip>
                                )}
                                {canEdit && !isEditing && (
                                    <Button
                                        type="button"
                                        variant="outline"
                                        size="sm"
                                        className="ml-auto"
                                        disabled={!isCurrentImageThumbnail}
                                        onClick={() => setIsEditing(true)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                        {t('edit')}
                                    </Button>
                                )}
                            </div>
                            {canEdit && !isCurrentImageThumbnail && (
                                <p className="text-muted-foreground text-xs">
                                    {t('thumbnailOnlyEditable')}
                                </p>
                            )}
                            {editorName && (
                                <p className="text-muted-foreground text-xs">
                                    {t('editedBy', { name: editorName })}
                                </p>
                            )}
                        </div>
                        {isEditing &&
                        state.status === 'success' &&
                        currentImage ? (
                            <PredictionEditForm
                                specimenId={state.specimen.id}
                                image={currentImage}
                                onClose={() => setIsEditing(false)}
                            />
                        ) : (
                            <dl
                                className={cn(
                                    'grid gap-x-4 gap-y-2 text-sm',
                                    isEdited
                                        ? 'grid-cols-[max-content_max-content_1fr]'
                                        : 'grid-cols-[max-content_1fr]',
                                )}
                            >
                                {isEdited && (
                                    <Fragment>
                                        <dt />
                                        <dt className="text-muted-foreground text-xs">
                                            {t('original')}
                                        </dt>
                                        <dt className="text-muted-foreground text-xs">
                                            {t('edited')}
                                        </dt>
                                    </Fragment>
                                )}
                                <PredictionRow
                                    category={t('species')}
                                    value={predictions.species.value}
                                    originalValue={
                                        predictions.species.originalValue
                                    }
                                    isEdited={isEdited}
                                    status={state.status}
                                />

                                <PredictionRow
                                    category={t('sex')}
                                    value={predictions.sex.value}
                                    originalValue={
                                        predictions.sex.originalValue
                                    }
                                    isEdited={isEdited}
                                    status={state.status}
                                />

                                <PredictionRow
                                    category={t('abdomenStatus')}
                                    value={predictions.abdomenStatus.value}
                                    originalValue={
                                        predictions.abdomenStatus.originalValue
                                    }
                                    isEdited={isEdited}
                                    status={state.status}
                                />
                            </dl>
                        )}
                    </div>

                    <Separator />

                    <div className="space-y-3">
                        <p className="text-sm font-semibold">
                            {t('modelConfidence')}
                        </p>
                        <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                            <ConfidencePredictionRow
                                category={t('species')}
                                label={predictions.species.modelValue}
                                confidencePercentage={
                                    predictions.species.confidencePercentage
                                }
                                status={state.status}
                            />

                            <ConfidencePredictionRow
                                category={t('sex')}
                                label={predictions.sex.modelValue}
                                confidencePercentage={
                                    predictions.sex.confidencePercentage
                                }
                                status={state.status}
                            />

                            <ConfidencePredictionRow
                                category={t('abdomenStatus')}
                                label={predictions.abdomenStatus.modelValue}
                                confidencePercentage={
                                    predictions.abdomenStatus
                                        .confidencePercentage
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
