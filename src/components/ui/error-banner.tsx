'use client';

import { useTranslations } from 'next-intl';

interface ErrorBannerProps {
    message?: string;
    onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
    const t = useTranslations('Common');

    return (
        <div
            role="alert"
            className="bg-destructive/10 text-destructive flex items-center justify-between gap-4 rounded-md p-4 text-sm"
        >
            <span>{message ?? t('error')}</span>
            {onRetry && (
                <button
                    type="button"
                    onClick={onRetry}
                    className="shrink-0 underline underline-offset-4 hover:opacity-70"
                >
                    {t('tryAgain')}
                </button>
            )}
        </div>
    );
}
