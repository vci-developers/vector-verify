import { Button } from '@/components/ui/button';
import { RefreshCw, Upload } from 'lucide-react';

interface Dhis2SyncToolbarProps {
    selectedSiteCount: number;
    onSubmitSelected: () => void;
    onRefresh: () => void;
}

export default function Dhis2SyncToolbar({
    selectedSiteCount,
    onSubmitSelected,
    onRefresh,
}: Dhis2SyncToolbarProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs tabular-nums">
                {selectedSiteCount} selected
            </span>
            <Button variant="outline" size="sm" onClick={onRefresh}>
                <RefreshCw />
                Refresh
            </Button>
            <Button
                size="sm"
                onClick={onSubmitSelected}
                disabled={selectedSiteCount === 0}
            >
                <Upload />
                Submit selected
            </Button>
        </div>
    );
}
