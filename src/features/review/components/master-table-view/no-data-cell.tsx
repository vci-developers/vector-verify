import { FileQuestion } from 'lucide-react';

export function NoDataCell() {
  return (
    <div className="flex items-center gap-2 rounded-md border border-slate-200 bg-slate-50 px-3 py-2 dark:border-slate-800 dark:bg-slate-950/30">
      <FileQuestion className="h-4 w-4 text-slate-500 dark:text-slate-400" />
      <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
        No data recorded
      </span>
    </div>
  );
}
