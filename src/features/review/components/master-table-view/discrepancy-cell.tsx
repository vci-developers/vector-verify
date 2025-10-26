import { AlertTriangle } from 'lucide-react';

interface DiscrepancyCellProps {
  values: string[];
}

export function DiscrepancyCell({ values }: DiscrepancyCellProps) {
  return (
    <div className="space-y-2">
      <div className="inline-flex items-center gap-1.5 rounded-md border border-amber-200 bg-amber-50 px-2 py-1 dark:border-amber-800 dark:bg-amber-950/30">
        <AlertTriangle className="h-3.5 w-3.5 text-amber-600 dark:text-amber-500" />
        <span className="text-xs font-medium text-amber-800 dark:text-amber-400">
          Multiple values
        </span>
      </div>
      <div className="space-y-1 pl-1">
        {values.map((value, idx) => (
          <div
            key={idx}
            className="text-foreground flex items-start gap-1.5 text-sm"
          >
            <span className="text-muted-foreground mt-0.5">•</span>
            <span>{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
