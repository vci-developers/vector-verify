import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { AlertTriangle } from 'lucide-react';
import { Fragment } from 'react/jsx-runtime';

interface ConfidencePredictionRowProps {
    category: string;
    label: string | null | undefined;
    confidencePercentage: number | null;
    isLoading: boolean;
}

const MODEL_CONFIDENCE_THRESHOLD = 75;

export default function ConfidencePredictionRow({
    category,
    label,
    confidencePercentage,
    isLoading,
}: ConfidencePredictionRowProps) {
    const isLowConfidence =
        !isLoading &&
        confidencePercentage != null &&
        confidencePercentage < MODEL_CONFIDENCE_THRESHOLD;

    return (
        <Fragment>
            <dt className="text-muted-foreground">{category}</dt>
            <dd
                className={cn(
                    isLowConfidence && 'text-destructive',
                    'flex gap-x-4',
                )}
            >
                <span className="w-10 shrink-0">
                    {isLoading ? (
                        <Skeleton height="sm" width="sm" />
                    ) : label && confidencePercentage != null ? (
                        `${confidencePercentage}%`
                    ) : (
                        '—'
                    )}
                </span>
                <span className="w-4 shrink-0">
                    {isLowConfidence && (
                        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                    )}
                </span>
            </dd>
        </Fragment>
    );
}
