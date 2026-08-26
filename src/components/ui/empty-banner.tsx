import type { ReactElement } from 'react';

interface EmptyBannerProps {
    message: string;
    children?: ReactElement;
}

export default function EmptyBanner({ message, children }: EmptyBannerProps) {
    return (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
            {children}
            <p className="text-muted-foreground text-sm">{message}</p>
        </div>
    );
}
