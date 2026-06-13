'use client';

import type { Dhis2SyncSiteResultStatus } from '@/api/dhis2/validation/dhis2-sync-result-schema';
import { Spinner } from '@/components/ui/spinner';
import { CheckCircle2, TriangleAlert, XCircle } from 'lucide-react';

interface Dhis2DryRunPreviewItemProps {
    isValidating: boolean;
    status?: Dhis2SyncSiteResultStatus;
    message?: string;
}

export default function Dhis2DryRunPreviewItem({
    isValidating,
    status,
    message,
}: Dhis2DryRunPreviewItemProps) {
    if (!status) {
        return isValidating ? (
            <p className="text-muted-foreground flex items-center gap-2 text-xs">
                <Spinner className="size-3" />
                Validating…
            </p>
        ) : null;
    }

    if (status === 'success') {
        return (
            <p className="text-success flex items-center gap-2 text-xs">
                <CheckCircle2 className="size-3.5 shrink-0" />
                Validation passed.
            </p>
        );
    }

    const isSkipped = status === 'skipped';

    return (
        <div
            className={
                isSkipped
                    ? 'text-warning-foreground text-xs'
                    : 'text-destructive text-xs'
            }
        >
            <p className="flex items-center gap-2 font-medium">
                {isSkipped ? (
                    <TriangleAlert className="size-3.5 shrink-0" />
                ) : (
                    <XCircle className="size-3.5 shrink-0" />
                )}
                {isSkipped ? 'Skipped' : 'Validation failed'}
            </p>
            {message && (
                <p className="mt-1 max-h-64 max-w-md overflow-y-auto whitespace-pre-line">
                    {message}
                </p>
            )}
        </div>
    );
}
