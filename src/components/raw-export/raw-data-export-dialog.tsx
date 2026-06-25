'use client';

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '../ui/dialog';
import RawDataExportRow from './raw-data-export-row';

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
    const specimensPath = `/specimens/export/csv?programId=${programId}&sessionType=SURVEILLANCE&includeInferenceResult=true`;
    const surveillanceFormsPath = `/sessions/export/surveillance-forms/csv?programId=${programId}`;
    const annotationsPath = `/annotations/export?programId=${programId}`;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Raw Data Export</DialogTitle>
                    <DialogDescription>
                        Generate a temporary signed download link for raw,
                        unprocessed CSVs straight from the backend. These
                        exports are not affected by the Operations filters.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-2">
                    <RawDataExportRow
                        title="Specimens"
                        description="Raw specimen records for surveillance sessions, including inference results."
                        path={specimensPath}
                    />
                    <RawDataExportRow
                        title="Surveillance Forms"
                        description="Raw surveillance form submissions for the program."
                        path={surveillanceFormsPath}
                    />
                    <RawDataExportRow
                        title="Annotations"
                        description="Raw annotation records with specimen, image, and inference data."
                        path={annotationsPath}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
