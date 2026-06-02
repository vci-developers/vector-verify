'use client';

import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';
import { format } from 'date-fns';
import { AlertCircle, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { detectPredictionConflict } from '@/features/review/site-details/image-review/utils/detect-prediction-conflict';

interface ImageReviewDetailsProps {
    specimen: Specimen;
    currentImage: SpecimenImage | null;
    specimenImages: SpecimenImage[];
}

export default function ImageReviewDetails({
    specimen,
    currentImage,
    specimenImages,
}: ImageReviewDetailsProps) {
    const t = useTranslations('Review.ImageReview');
    const hasConflict = detectPredictionConflict(specimenImages);
    const totalImagesUploaded = specimen.images?.length ?? 0;
    const expectedImagesCount = specimen.expectedImages;

    const hasReliableExpectedCount =
        expectedImagesCount != null &&
        expectedImagesCount > 0 &&
        totalImagesUploaded <= expectedImagesCount;

    const imagesCapturedLabel = hasReliableExpectedCount
        ? `${totalImagesUploaded} of ${expectedImagesCount}`
        : `${totalImagesUploaded}`;
    const isMissingExpectedImages =
        hasReliableExpectedCount && totalImagesUploaded < expectedImagesCount;

    const capturedAtLabel = currentImage?.capturedAt
        ? format(new Date(currentImage.capturedAt), 'MMM d, yyyy h:mm a')
        : '—';
    const submittedAtLabel = currentImage?.submittedAt
        ? format(new Date(currentImage.submittedAt), 'MMM d, yyyy h:mm a')
        : '—';

    return (
        <div className="space-y-4">
            <div>
                <p className="text-muted-foreground text-sm uppercase">
                    Specimen ID
                </p>
                <p className="text-lg font-semibold">{specimen.specimenId}</p>
            </div>

            <Separator />

            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">Session ID</dt>
                <dd>{specimen.sessionId}</dd>

                <dt className="text-muted-foreground">Images Captured</dt>
                <dd
                    className={cn(
                        isMissingExpectedImages &&
                            'text-destructive font-medium',
                    )}
                >
                    {isMissingExpectedImages && (
                        <AlertCircle className="h-3.5 w-3.5" />
                    )}
                    {imagesCapturedLabel}
                </dd>

                <dt className="text-muted-foreground">
                    Needs Further Processing
                </dt>
                <dd>
                    <Badge
                        variant={
                            specimen.shouldProcessFurther
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {specimen.shouldProcessFurther ? 'Yes' : 'No'}
                    </Badge>
                </dd>
            </dl>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">Current Image</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Captured At</dt>
                    <dd>{capturedAtLabel}</dd>

                    <dt className="text-muted-foreground">Submitted At</dt>
                    <dd>{submittedAtLabel}</dd>
                </dl>
            </div>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">Model Predictions</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Species</dt>
                    <dd>{currentImage?.species ?? '—'}</dd>

                    <dt className="text-muted-foreground">Sex</dt>
                    <dd>{currentImage?.sex ?? '—'}</dd>

                    <dt className="text-muted-foreground">Abdomen Status</dt>
                    <dd>{currentImage?.abdomenStatus ?? '—'}</dd>

                    <dt className="text-muted-foreground">
                        {t('predictionConflict')}
                    </dt>
                    <dd>
                        <Badge
                            variant={hasConflict ? 'destructive' : 'secondary'}
                        >
                            {hasConflict && (
                                <TriangleAlert className="h-3 w-3" />
                            )}
                            {hasConflict
                                ? t('conflictDetected')
                                : t('noConflict')}
                        </Badge>
                    </dd>
                </dl>
            </div>
        </div>
    );
}
