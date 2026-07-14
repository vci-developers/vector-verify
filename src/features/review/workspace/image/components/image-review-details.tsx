import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/utils/cn';
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { AlertCircle } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface ImageReviewDetailsProps {
    specimen: Specimen;
    currentImage: SpecimenImage | null;
    timezone: string | null;
}

export default function ImageReviewDetails({
    specimen,
    currentImage,
    timezone,
}: ImageReviewDetailsProps) {
    const t = useTranslations('ReviewImage');
    console.log(specimen);

    const totalImagesUploaded = specimen.images?.length ?? 0;
    const expectedImagesCount = specimen.expectedImages;

    const hasReliableExpectedCount =
        expectedImagesCount != null &&
        expectedImagesCount > 0 &&
        totalImagesUploaded <= expectedImagesCount;

    const imagesCapturedLabel = hasReliableExpectedCount
        ? `${totalImagesUploaded} / ${expectedImagesCount}`
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

    function getMaxConfidencePercentage(logits: number[]): number {
        const exps = logits.map(x => Math.exp(x));
        const sumExps = exps.reduce((a, b) => a + b, 0);
        return Math.round(Math.max(...exps.map(x => x / sumExps)) * 1000) / 10;
    }

    return (
        <div className="space-y-4">
            <div>
                <p className="text-muted-foreground text-sm uppercase">
                    {t('specimenId')}
                </p>
                <p className="text-lg font-semibold">{specimen.specimenId}</p>
            </div>

            <Separator />

            <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                <dt className="text-muted-foreground">{t('sessionId')}</dt>
                <dd>{specimen.sessionId}</dd>

                <dt className="text-muted-foreground">{t('imagesCaptured')}</dt>
                <dd
                    className={cn(
                        'flex items-center gap-1',
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
                    {t('needsFurtherProcessing')}
                </dt>
                <dd>
                    <Badge
                        variant={
                            specimen.shouldProcessFurther
                                ? 'default'
                                : 'secondary'
                        }
                    >
                        {specimen.shouldProcessFurther ? t('yes') : t('no')}
                    </Badge>
                </dd>
            </dl>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">{t('currentImage')}</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">{t('capturedAt')}</dt>
                    <dd>{capturedAtLabel}</dd>

                    <dt className="text-muted-foreground">
                        {t('submittedAt')}
                    </dt>
                    <dd>{submittedAtLabel}</dd>
                </dl>
            </div>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">{t('modelPredictions')}</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">{t('species')}</dt>
                    <dd>{currentImage?.species ?? '—'}</dd>

                    <dt className="text-muted-foreground">{t('sex')}</dt>
                    <dd>{currentImage?.sex ?? '—'}</dd>

                    <dt className="text-muted-foreground">
                        {t('abdomenStatus')}
                    </dt>
                    <dd>{currentImage?.abdomenStatus ?? '—'}</dd>
                </dl>
            </div>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">{t('modelConfidence')}</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">{t('species')}</dt>
                    <dd>
                        {currentImage?.species
                            ? (getMaxConfidencePercentage(
                                  currentImage!.inferenceResult!.speciesLogits,
                              ) ?? null) + '%'
                            : '—'}
                    </dd>

                    <dt className="text-muted-foreground">{t('sex')}</dt>
                    <dd>
                        {currentImage?.sex
                            ? (getMaxConfidencePercentage(
                                  currentImage!.inferenceResult!.sexLogits,
                              ) ?? null) + '%'
                            : '—'}
                    </dd>

                    <dt className="text-muted-foreground">
                        {t('abdomenStatus')}
                    </dt>
                    <dd>
                        {currentImage?.abdomenStatus
                            ? (getMaxConfidencePercentage(
                                  currentImage!.inferenceResult!
                                      .abdomenStatusLogits,
                              ) ?? null) + '%'
                            : '—'}
                    </dd>
                </dl>
            </div>
        </div>
    );
}
