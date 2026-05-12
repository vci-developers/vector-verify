import type { SpecimenImage } from '@/api/specimen-image/validation/specimen-image-schema';
import type { Specimen } from '@/api/specimen/validation/specimen-schema';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { format } from 'date-fns';

interface ImageReviewDetailsProps {
    specimen: Specimen;
    currentImage: SpecimenImage | null;
}

export default function ImageReviewDetails({
    specimen,
    currentImage,
}: ImageReviewDetailsProps) {
    const session = specimen.session;
    const collectionDateLabel = session?.collectionDate
        ? format(new Date(session.collectionDate), 'MMM d, yyyy')
        : '—';
    const capturedAtLabel = currentImage?.capturedAt
        ? format(new Date(currentImage.capturedAt), 'MMM d, yyyy h:mm a')
        : '—';

    return (
        <div className="space-y-4">
            <div>
                <p className="text-muted-foreground text-xs">Specimen ID</p>
                <p className="text-lg font-semibold">{specimen.specimenId}</p>
            </div>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">Session</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Session ID</dt>
                    <dd>{session?.sessionId ?? '—'}</dd>

                    <dt className="text-muted-foreground">Collection Date</dt>
                    <dd>{collectionDateLabel}</dd>

                    <dt className="text-muted-foreground">
                        Specimen Condition
                    </dt>
                    <dd>{session?.specimenCondition ?? '—'}</dd>

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
            </div>

            <Separator />

            <div className="space-y-3">
                <p className="text-sm font-semibold">Current Image</p>
                <dl className="grid grid-cols-[max-content_1fr] gap-x-4 gap-y-2 text-sm">
                    <dt className="text-muted-foreground">Captured At</dt>
                    <dd>{capturedAtLabel}</dd>
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
                </dl>
            </div>
        </div>
    );
}
