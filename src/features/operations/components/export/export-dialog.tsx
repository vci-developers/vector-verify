'use client';

import {
    type GetSessionsReportQueryParams,
    getSessionsReportQueryParamsSchema,
} from '@/api/session/validation/get-sessions-report-schema';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { triggerFileDownload } from '@/lib/download/trigger-file-download';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { constructQueryString } from '@/lib/network/construct-query-string';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { Download, Loader2 } from 'lucide-react';
import { useState } from 'react';

interface ExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: number;
    locationQueryParam: LocationQueryParam;
    locationName: string;
    startDate?: string;
    endDate?: string;
}

export default function ExportDialog({
    open,
    onOpenChange,
    programId,
    locationQueryParam,
    locationName,
    startDate,
    endDate,
}: ExportDialogProps) {
    const [isExporting, setIsExporting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) setError(null);
        onOpenChange(nextOpen);
    }

    async function handleExport() {
        setIsExporting(true);
        setError(null);

        try {
            const locationFilter =
                'district' in locationQueryParam
                    ? { districts: [locationQueryParam.district] }
                    : { siteIds: [locationQueryParam.siteId] };

            const queryString =
                constructQueryString<GetSessionsReportQueryParams>(
                    {
                        startDate,
                        endDate,
                        sessionType: 'SURVEILLANCE',
                        programId: programId,
                        ...locationFilter,
                    },
                    getSessionsReportQueryParamsSchema,
                );

            const response = await fetch(`/api/sessions/report${queryString}`, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const getSessionsReportErrorResult: Result<
                    never,
                    NetworkError
                > = await response.json();
                setError(
                    getSessionsReportErrorResult.ok
                        ? 'An unexpected error occurred. Please try again.'
                        : networkErrorMessage(
                              getSessionsReportErrorResult.error,
                          ),
                );
                return;
            }

            await triggerFileDownload(
                response,
                `${locationName}-report-${startDate}-to-${endDate}.xlsx`,
            );

            handleOpenChange(false);
        } catch {
            setError('An unexpected error occurred. Please try again.');
        } finally {
            setIsExporting(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Export Report</DialogTitle>
                    <DialogDescription>
                        This will download session data for{' '}
                        <span className="text-foreground font-medium">
                            {locationName}
                        </span>{' '}
                        from{' '}
                        <span className="text-foreground font-medium">
                            {startDate}
                        </span>{' '}
                        to{' '}
                        <span className="text-foreground font-medium">
                            {endDate}
                        </span>
                        .
                    </DialogDescription>
                </DialogHeader>

                {error && <p className="text-destructive text-sm">{error}</p>}

                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => handleOpenChange(false)}
                        disabled={isExporting}
                    >
                        Cancel
                    </Button>
                    <Button onClick={handleExport} disabled={isExporting}>
                        {isExporting ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <Download />
                        )}
                        {isExporting ? 'Exporting…' : 'Export'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
