import ErrorBanner from '@/components/ui/error-banner';
import { Card } from '@/components/ui/card';
import type { ReactNode } from 'react';

interface ErrorStateProps {
    message?: string;
    onRetry?: () => void;
    cardClassName?: string;
    children?: ReactNode;
}

function ErrorState({
    message,
    onRetry,
    cardClassName,
    children,
}: ErrorStateProps) {
    return (
        <div className="space-y-4">
            <ErrorBanner message={message} onRetry={onRetry} />
            {children ?? (
                <Card variant="destructive" className={cardClassName} />
            )}
        </div>
    );
}

export { ErrorState };
