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
import { useGetAllReviewLogs } from '@/api/review-log/hooks/use-get-all-review-logs';
import ErrorBanner from '@/components/ui/error-banner';
import type { ReviewLog } from '@/api/review-log/validation/review-log-schema';
import PredictionRow from '@/features/review/workspace/image/components/prediction-row';
import PredictionEditForm from '@/features/review/workspace/image/components/prediction-edit-form';
import { isThumbnailImage } from '@/lib/specimen/is-thumbnail-image';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import type { ImageLoadStatus } from '@/components/specimen/signed-specimen-image';
import { getLatestPredictionEditLog } from '../utils/get-latest-prediction-edit-log';
import { getSpecimenIdEditHistory } from '@/features/review/workspace/image/utils/get-specimen-id-edit-history';
import SpecimenIdEditForm from './specimen-id-edit-form';

type DetailsState =
    | { status: 'loading' }
    | { status: 'error' }
    | { status: 'success'; specimen: Specimen };

interface DetailsContentProps {
    currentImage: SpecimenImage | null;
    imageAvailability: ImageLoadStatus;
    editingSpecimen: Specimen | null;
    onEditSpecimenId: (specimen: Specimen | null) => void;
    timezone: string | null;
    readOnly: boolean;
    state: DetailsState;
}

interface ImageReviewDetailsProps extends DetailsContentProps {
    siteId: number;
    collectionCycleId?: number;
}

export default function ImageReviewDetails({
    siteId,
    collectionCycleId,
    ...contentProps
}: ImageReviewDetailsProps) {
    const t = useTranslations('ReviewImage');
    const { data: predictionResult, isError: isPredictionError } =
        useGetAllReviewLogs({
            siteId,
            collectionCycleId,
            action: 'update_specimen_image_prediction',
        });
    const { data: specimenIdResult, isError: isSpecimenIdError } =
        useGetAllReviewLogs({
            siteId,
            collectionCycleId,
            action: 'update_specimen_thumbnail_prediction',
        });

    const hasReviewLogsError =
        isPredictionError ||
        isSpecimenIdError ||
        predictionResult?.ok === false ||
        specimenIdResult?.ok === false;
    const { currentImage, editingSpecimen } = contentProps;

    // Reset the editor on image changes without remounting the log queries.
    return (
        <>
            {hasReviewLogsError && (
                <div className="mb-4">
                    <ErrorBanner message={t('reviewLogsError')} />
                </div>
            )}
            <DetailsContent
                key={
                    editingSpecimen
                        ? `editing-${editingSpecimen.id}`
                        : currentImage?.id
                }
                {...contentProps}
                predictionLogs={
                    predictionResult?.ok
                        ? predictionResult.data.logs
                        : undefined
                }
                specimenIdLogs={
                    specimenIdResult?.ok
                        ? specimenIdResult.data.logs
                        : undefined
                }
            />
        </>
    );
}

function DetailsContent({
    currentImage,
    predictionLogs,
    specimenIdLogs,
    imageAvailability,
    editingSpecimen,
    onEditSpecimenId,
    timezone,
    readOnly,
    state,
}: DetailsContentProps & {
    predictionLogs: ReviewLog[] | undefined;
    specimenIdLogs: ReviewLog[] | undefined;
}) {
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

    const latestEditLog =
        currentImage && predictionLogs
            ? getLatestPredictionEditLog(predictionLogs, currentImage.id)
            : undefined;
    const specimenIdEditHistory =
        state.status === 'success' && specimenIdLogs
            ? getSpecimenIdEditHistory(specimenIdLogs, state.specimen.id)
            : undefined;
    const isEdited = latestEditLog !== undefined;
    const editorName = latestEditLog?.performedBy
        ? (latestEditLog.performedBy.name ??
          t('unknownUser', { userId: latestEditLog.performedBy.userId }))
        : null;
    const canEdit = !readOnly && state.status === 'success';
    const isCheckingImages = imageAvailability === 'pending';
    const specimenIdEditor =
        specimenIdEditHistory?.latestEditLog.performedBy?.name ??
        t('unknownSpecimenIdEditor');

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
            <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <p className="text-muted-foreground text-sm uppercase">
                        {t('specimenId')}
                    </p>
                    {specimenIdEditHistory && (
                        <Badge variant="secondary">{t('edited')}</Badge>
                    )}
                    {canEdit &&
                        isCurrentImageThumbnail &&
                        !editingSpecimen &&
                        !isEditing && (
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <span
                                        className="ml-auto"
                                        tabIndex={
                                            isCheckingImages ? 0 : undefined
                                        }
                                    >
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            aria-label={t('editSpecimenId')}
                                            disabled={isCheckingImages}
                                            onClick={() => {
                                                if (state.status === 'success')
                                                    onEditSpecimenId(
                                                        state.specimen,
                                                    );
                                            }}
                                        >
                                            <Pencil className="h-4 w-4" />
                                            {t('edit')}
                                        </Button>
                                    </span>
                                </TooltipTrigger>
                                {isCheckingImages && (
                                    <TooltipContent>
                                        {t('checkingImages')}
                                    </TooltipContent>
                                )}
                            </Tooltip>
                        )}
                </div>
                {editingSpecimen ? (
                    <SpecimenIdEditForm
                        specimen={editingSpecimen}
                        canSave={
                            canEdit &&
                            isCurrentImageThumbnail &&
                            state.status === 'success' &&
                            state.specimen.id === editingSpecimen.id &&
                            !isCheckingImages
                        }
                        onClose={() => onEditSpecimenId(null)}
                    />
                ) : state.status === 'success' ? (
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
                {editingSpecimen && isCheckingImages && (
                    <p className="text-muted-foreground text-xs" role="status">
                        {t('checkingImages')}
                    </p>
                )}
                {specimenIdEditHistory && (
                    <div className="text-muted-foreground space-y-1 text-xs">
                        <p>
                            {t('originalSpecimenId', {
                                value: specimenIdEditHistory.originalValue,
                            })}
                        </p>
                        <p>{t('editedBy', { name: specimenIdEditor })}</p>
                    </div>
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
                                    {t('modelPredictions')}
                                </p>
                                {isEdited && (
                                    <Badge variant="secondary">
                                        {t('edited')}
                                    </Badge>
                                )}
                                {canEdit && !isEditing && !editingSpecimen && (
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
