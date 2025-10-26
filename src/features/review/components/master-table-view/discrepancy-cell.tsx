import { AlertTriangle } from 'lucide-react';

export function DiscrepancyCell() {
  return (
    <div className="inline-flex items-center justify-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-3 py-1.5 dark:border-amber-800 dark:bg-amber-950/30">
      <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
      <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
        Discrepancy - needs resolution
      </span>
    </div>
  );
}
