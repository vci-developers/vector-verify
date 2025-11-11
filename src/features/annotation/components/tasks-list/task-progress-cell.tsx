import { Progress } from '@/ui/progress';
import { useAnnotationTaskProgressQuery } from '@/features/annotation/hooks/use-annotation-task-progress';
import { AnnotationTask } from '@/features/annotation/types';

export function TaskProgressCell({ task }: { task: AnnotationTask }) {
  const { data: progressData } = useAnnotationTaskProgressQuery(task.id);
  const {
    percent = 0,
    annotated = 0,
    total = 0,
    flagged = 0,
  } = progressData ?? {};
  const displayPercent = Math.round(percent);
  const completed = Math.max(0, Math.min(total, annotated + flagged));
  const hasItems = total > 0;

  return (
    <div className="mx-auto flex max-w-[360px] flex-col gap-2">
      <div className="flex items-center gap-2">
        <Progress className="w-full" value={percent} />
        <span className="text-muted-foreground text-xs font-semibold">
          {displayPercent}%
        </span>
      </div>
      <div className="text-muted-foreground text-xs">
        {hasItems ? (
          `${completed.toLocaleString()} of ${total.toLocaleString()} images completed`
        ) : (
          <span className="italic">No annotations for this task.</span>
        )}
      </div>
    </div>
  );
}
