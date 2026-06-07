import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';
import { RefreshCw, Upload } from 'lucide-react';

interface Dhis2SyncToolbarProps {
    selectedSiteRowCount: number;
    isRefreshing: boolean;
    onSubmitSelected: () => void;
    onRefresh: () => void;
}

export default function Dhis2SyncToolbar({
    selectedSiteRowCount,
    isRefreshing,
    onSubmitSelected,
    onRefresh,
}: Dhis2SyncToolbarProps) {
    return (
        <div className="flex items-center gap-3">
            <span className="text-muted-foreground text-xs tabular-nums">
                {selectedSiteRowCount} selected
            </span>
            <Button
                variant="outline"
                size="sm"
                onClick={onRefresh}
                disabled={isRefreshing}
            >
                {isRefreshing ? <Spinner className="size-4" /> : <RefreshCw />}
                Refresh
            </Button>
            <Button
                size="sm"
                onClick={onSubmitSelected}
                disabled={selectedSiteRowCount === 0}
            >
                <Upload />
                Submit selected
            </Button>
        </div>
    );
}
