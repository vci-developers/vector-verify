import { Progress } from '@/ui/progress';
import type { AnnotationTaskProgress } from '@/features/annotation/types';

interface TaskProgressBreakdownProps {
  taskProgress?: AnnotationTaskProgress;
}

export function TaskProgressBreakdown({
  taskProgress,
}: TaskProgressBreakdownProps) {
  const progressPercent = taskProgress?.percent ?? 0;

  return (
    <div className="space-y-1">
      <div className="text-muted-foreground flex items-center justify-between text-xs font-semibold uppercase">
        <span>Specimens Annotated</span>
        <span>{progressPercent.toFixed(0)}% Complete</span>
      </div>
      <Progress
        value={progressPercent}
        className="h-2 overflow-hidden rounded-full [&>div]:bg-[#22c55e] bg-[#22c55e]/40"
      />
    </div>
  );
}
