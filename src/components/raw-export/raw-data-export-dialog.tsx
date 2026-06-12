'use client';

import { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import RawDataExportRow from './raw-data-export-row';
import { err, ok, type Result } from '@/lib/result/result';
import {
    networkErrorMessage,
    type NetworkError,
} from '@/lib/network/network-error';
import { triggerFileDownload } from '@/lib/download/trigger-file-download';
import {
    getSpecimensExportQueryParamsSchema,
    type GetSpecimensExportQueryParams,
} from '@/api/specimen/validation/get-specimens-export-schema';
import { constructQueryString } from '@/lib/network/construct-query-string';
import {
    getSurveillanceFormsExportQueryParamsSchema,
    type GetSurveillanceFormsExportQueryParams,
} from '@/api/surveillance-form/validation/get-surveillance-forms-export-schema';
import {
    getAnnotationsExportQueryParamsSchema,
    type GetAnnotationsExportQueryParams,
} from '@/api/annotation/validation/get-annotations-export-schema';

interface RawDataExportDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    programId: number;
}

export default function RawDataExportDialog({
    open,
    onOpenChange,
    programId,
}: RawDataExportDialogProps) {
    const [isSpecimensExportDownloading, setIsSpecimensExportDownloading] =
        useState(false);
    const [specimensExportError, setSpecimensExportError] = useState<
        string | null
    >(null);

    const [
        isSurveillanceFormsExportDownloading,
        setIsSurveillanceFormsExportDownloading,
    ] = useState(false);
    const [surveillanceFormsExportError, setSurveillanceFormsExportError] =
        useState<string | null>(null);

    const [isAnnotationsExportDownloading, setIsAnnotationsExportDownloading] =
        useState(false);
    const [annotationsExportError, setAnnotationsExportError] = useState<
        string | null
    >(null);

    function handleOpenChange(nextOpen: boolean) {
        if (!nextOpen) {
            setSpecimensExportError(null);
            setSurveillanceFormsExportError(null);
            setAnnotationsExportError(null);
        }
        onOpenChange(nextOpen);
    }

    async function downloadRawExport(
        path: string,
        filename: string,
    ): Promise<Result<void, NetworkError>> {
        try {
            const response = await fetch(path, {
                method: 'GET',
                credentials: 'include',
            });

            if (!response.ok) {
                const errorResult: Result<never, NetworkError> =
                    await response.json();
                return errorResult.ok ? err({ kind: 'unknown' }) : errorResult;
            }

            await triggerFileDownload(response, filename);
            return ok(undefined);
        } catch {
            return err({ kind: 'network' });
        }
    }

    async function handleDownloadSpecimensExport() {
        const queryString = constructQueryString<GetSpecimensExportQueryParams>(
            {
                programId,
                sessionType: 'SURVEILLANCE',
                includeInferenceResult: true,
            },
            getSpecimensExportQueryParamsSchema,
        );

        setIsSpecimensExportDownloading(true);
        const result = await downloadRawExport(
            `/api/specimens/export/csv${queryString}`,
            'specimens_export_raw.csv',
        );
        setSpecimensExportError(
            result.ok ? null : networkErrorMessage(result.error),
        );
        setIsSpecimensExportDownloading(false);
    }

    async function handleDownloadSurveillanceFormsExport() {
        const queryString =
            constructQueryString<GetSurveillanceFormsExportQueryParams>(
                {
                    programId,
                },
                getSurveillanceFormsExportQueryParamsSchema,
            );

        setIsSurveillanceFormsExportDownloading(true);
        const result = await downloadRawExport(
            `/api/sessions/export/surveillance-forms/csv${queryString}`,
            'surveillance_forms_export_raw.csv',
        );
        setSurveillanceFormsExportError(
            result.ok ? null : networkErrorMessage(result.error),
        );
        setIsSurveillanceFormsExportDownloading(false);
    }

    async function handleDownloadAnnotationsExport() {
        const queryString =
            constructQueryString<GetAnnotationsExportQueryParams>(
                {
                    programId,
                },
                getAnnotationsExportQueryParamsSchema,
            );
        setIsAnnotationsExportDownloading(true);
        const result = await downloadRawExport(
            `/api/annotations/export${queryString}`,
            'annotations_export_raw.csv',
        );
        setAnnotationsExportError(
            result.ok ? null : networkErrorMessage(result.error),
        );
        setIsAnnotationsExportDownloading(false);
    }

    return (
        <Dialog open={open} onOpenChange={handleOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Raw Data Export</DialogTitle>
                    <DialogDescription>
                        Download raw, unprocessed CSVs for your program straight
                        from the backend. These exports are not affected by the
                        Operations filters.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <RawDataExportRow
                        title="Specimens"
                        description="Raw specimen records for surveillance sessions, including inference results."
                        isDownloading={isSpecimensExportDownloading}
                        error={specimensExportError}
                        onDownload={handleDownloadSpecimensExport}
                    />
                    <RawDataExportRow
                        title="Surveillance Forms"
                        description="Raw surveillance form submissions for the program."
                        isDownloading={isSurveillanceFormsExportDownloading}
                        error={surveillanceFormsExportError}
                        onDownload={handleDownloadSurveillanceFormsExport}
                    />
                    <RawDataExportRow
                        title="Annotations"
                        description="Raw annotation records with specimen, image, and inference data."
                        isDownloading={isAnnotationsExportDownloading}
                        error={annotationsExportError}
                        onDownload={handleDownloadAnnotationsExport}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
