import { FileQuestion } from 'lucide-react';

export function NoDataCell() {
  return (
    <div className="bg-destructive/5 hover:bg-destructive/10 dark:bg-destructive/10 dark:hover:bg-destructive/15 flex items-center justify-center gap-2 rounded-md px-3.5 py-2.5 transition-colors">
      <FileQuestion className="text-destructive/70 dark:text-destructive/80 h-4 w-4 flex-shrink-0" />
      <span className="text-destructive/90 dark:text-destructive/80 text-xs font-medium">
        No data recorded
      </span>
    </div>
  );
}
