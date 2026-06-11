'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import RawDataExportRow from './raw-data-export-row';
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
import { triggerBrowserDownload } from '@/lib/download/trigger-browser-download';

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
    const specimensExportQueryString =
        constructQueryString<GetSpecimensExportQueryParams>(
            {
                programId,
                sessionType: 'SURVEILLANCE',
                includeInferenceResult: true,
            },
            getSpecimensExportQueryParamsSchema,
        );
    const specimensExportPath = `/api/specimens/export/csv${specimensExportQueryString}`;

    const surveillanceFormsExportQueryString =
        constructQueryString<GetSurveillanceFormsExportQueryParams>(
            { programId },
            getSurveillanceFormsExportQueryParamsSchema,
        );
    const surveillanceFormsExportPath = `/api/sessions/export/surveillance-forms/csv${surveillanceFormsExportQueryString}`;

    const annotationsExportQueryString =
        constructQueryString<GetAnnotationsExportQueryParams>(
            { programId },
            getAnnotationsExportQueryParamsSchema,
        );
    const annotationsExportPath = `/api/annotations/export${annotationsExportQueryString}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                        onDownload={() =>
                            triggerBrowserDownload(specimensExportPath)
                        }
                    />
                    <RawDataExportRow
                        title="Surveillance Forms"
                        description="Raw surveillance form submissions for the program."
                        onDownload={() =>
                            triggerBrowserDownload(surveillanceFormsExportPath)
                        }
                    />
                    <RawDataExportRow
                        title="Annotations"
                        description="Raw annotation records with specimen, image, and inference data."
                        onDownload={() =>
                            triggerBrowserDownload(annotationsExportPath)
                        }
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
