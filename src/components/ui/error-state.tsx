'use client';

import { Skeleton, type SkeletonProps } from '@/components/ui/skeleton';
import { useTranslations } from 'next-intl';

interface ErrorStateProps extends Omit<SkeletonProps, 'variant'> {
    onRetry?: () => void;
    errorMessage?: string;
}

function ErrorState({ onRetry, errorMessage, ...skeletonProps }: ErrorStateProps) {
    const t = useTranslations('Common');

    return (
        <Skeleton variant="destructive" {...skeletonProps}>
            <div className="flex h-full flex-col items-center justify-center gap-2">
                <p className="text-destructive text-sm font-medium">
                    {errorMessage ?? t('error')}
                </p>
                {onRetry && (
                    <button
                        type="button"
                        onClick={onRetry}
                        className="text-destructive text-xs underline underline-offset-4 hover:opacity-70"
                    >
                        {t('tryAgain')}
                    </button>
                )}
            </div>
        </Skeleton>
    );
}

export { ErrorState };
