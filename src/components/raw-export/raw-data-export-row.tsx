import { Download, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';

interface RawDataExportRowProps {
    title: string;
    description: string;
    isDownloading: boolean;
    error: string | null;
    onDownload: () => void;
}

export default function RawDataExportRow({
    title,
    description,
    isDownloading,
    error,
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
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onDownload}
                    disabled={isDownloading}
                >
                    {isDownloading ? (
                        <Loader2 className="animate-spin" />
                    ) : (
                        <Download />
                    )}
                    {isDownloading ? 'Downloading…' : 'Download'}
                </Button>
            </div>
            {error && <p className="text-destructive mt-2 text-sm">{error}</p>}
        </div>
    );
}
