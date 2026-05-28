'use client';

import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

interface ExportProgressPanelProps {
    completed: number;
    total: number;
    isExportDone: boolean;
    onDone: () => void;
}

export default function ExportProgressPanel({
    completed,
    total,
    isExportDone,
    onDone,
}: ExportProgressPanelProps) {
    return (
        <div className="bg-muted/50 space-y-3 rounded-lg p-4">
            <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                    {isExportDone
                        ? `Export complete — ${completed} of ${total} sites processed`
                        : `Exporting… ${completed} of ${total}`}
                </span>
                {isExportDone && (
                    <Button variant="outline" size="sm" onClick={onDone}>
                        Done
                    </Button>
                )}
            </div>
            <Progress value={total > 0 ? (completed / total) * 100 : 0} />
        </div>
    );
}
