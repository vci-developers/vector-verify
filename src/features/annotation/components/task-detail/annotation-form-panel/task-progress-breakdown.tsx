import { Progress } from '@/shared/ui/progress';
import type { AnnotationTaskProgress } from '@/features/annotation/types';
import { AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { Fragment } from 'react';

interface TaskProgressBreakdownProps {
  taskProgress?: AnnotationTaskProgress;
}

export function TaskProgressBreakdown({
  taskProgress,
}: TaskProgressBreakdownProps) {
  const totalCount = taskProgress?.total ?? 0;
  const annotatedCount = taskProgress?.annotated ?? 0;
  const flaggedCount = taskProgress?.flagged ?? 0;
  const pendingCount = Math.max(
    0,
    totalCount - (annotatedCount + flaggedCount),
  );
  const progressPercent = taskProgress?.percent ?? 0;

  return (
    <Fragment>
      <div className="space-y-1">
        <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold uppercase">
          <span>Specimens Annotated</span>
          <span>{progressPercent.toFixed(0)}% Complete</span>
        </div>
        <Progress
          value={progressPercent}
          className="bg-primary/15 h-2 overflow-hidden rounded-full"
        />
      </div>
      <div className="grid justify-items-center gap-2 sm:grid-cols-2 sm:justify-items-stretch lg:grid-cols-3">
        <div className="bg-primary/10 flex min-h-[60px] w-full min-w-[120px] flex-col items-center justify-center rounded-xl px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow-md sm:min-w-[140px] sm:flex-row sm:justify-between sm:gap-2.5">
          <div className="bg-primary/20 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <CheckCircle className="h-4.5 w-4.5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span className="text-muted-foreground text-xs font-medium">
              Annotated
            </span>
            <span className="text-foreground text-base font-semibold">
              {annotatedCount}
            </span>
          </div>
        </div>
        <div className="bg-warning/10 flex min-h-[60px] w-full min-w-[120px] flex-col items-center justify-center rounded-xl px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow-md sm:min-w-[140px] sm:flex-row sm:justify-between sm:gap-2.5">
          <div className="bg-warning/20 text-warning flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <Clock className="h-4.5 w-4.5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span className="text-muted-foreground text-xs font-medium">
              Pending
            </span>
            <span className="text-foreground text-base font-semibold">
              {pendingCount}
            </span>
          </div>
        </div>
        <div className="bg-destructive/10 flex min-h-[60px] w-full min-w-[120px] flex-col items-center justify-center rounded-xl px-2.5 py-2.5 shadow-sm transition-shadow hover:shadow-md sm:min-w-[140px] sm:flex-row sm:justify-between sm:gap-2.5">
          <div className="bg-destructive/20 text-destructive flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
            <AlertTriangle className="h-4.5 w-4.5" />
          </div>
          <div className="flex min-w-0 flex-1 flex-col items-center text-center">
            <span className="text-muted-foreground text-xs font-medium">
              Flagged
            </span>
            <span className="text-foreground text-base font-semibold">
              {flaggedCount}
            </span>
          </div>
        </div>
      </div>
    </Fragment>
  );
}
