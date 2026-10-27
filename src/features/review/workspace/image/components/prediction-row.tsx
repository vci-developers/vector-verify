import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/utils/cn';
import { Fragment } from 'react/jsx-runtime';

interface PredictionRowProps {
    category: string;
    value: string | null;
    originalValue: string | null;
    isEdited: boolean;
    status: 'loading' | 'error' | 'success';
}

export default function PredictionRow({
    category,
    value,
    originalValue,
    isEdited,
    status,
}: PredictionRowProps) {
    const isChanged = isEdited && value !== originalValue;

    return (
        <Fragment>
            <dt className="text-muted-foreground">{category}</dt>
            {isEdited && (
                <dd className="text-muted-foreground">
                    {originalValue ?? '—'}
                </dd>
            )}
            <dd>
                {status !== 'success' ? (
                    <Skeleton
                        height="sm"
                        width="sm"
                        variant={status === 'error' ? 'destructive' : 'default'}
                    />
                ) : (
                    <span
                        className={cn(
                            isChanged && 'bg-warning/20 rounded-sm px-1',
                        )}
                    >
                        {value ?? '—'}
                    </span>
                )}
            </dd>
        </Fragment>
    );
}
