import { Download } from 'lucide-react';
import { Button } from '../ui/button';

interface RawDataExportRowProps {
    title: string;
    description: string;
    onDownload: () => void;
}

export default function RawDataExportRow({
    title,
    description,
    onDownload,
}: RawDataExportRowProps) {
    return (
        <div className="border-border rounded-lg border p-3">
            <div className="flex items-center justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">{title}</p>
                    <p className="text-muted-foreground text-xs">
                        {description}
                    </p>
                </div>
                <Button variant="outline" size="sm" onClick={onDownload}>
                    <Download />
                    Download
                </Button>
            </div>
        </div>
    );
}
