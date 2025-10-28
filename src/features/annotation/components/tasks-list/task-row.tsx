'use client';

import { Badge } from '@/ui/badge';
import { Progress } from '@/ui/progress';
import { TableCell, TableRow } from '@/ui/table';
import { useAnnotationTaskProgressQuery } from '@/features/annotation/hooks/use-annotation-task-progress';
import {
  AnnotationTask,
  AnnotationTaskStatus,
} from '@/features/annotation/types';
import { formatDate } from '@/shared/core/utils/date';
import Link from 'next/link';

function getBadgeVariantForTaskStatus(
  status: AnnotationTaskStatus,
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'PENDING':
      return 'destructive';
    case 'IN_PROGRESS':
      return 'secondary';
    case 'COMPLETED':
      return 'default';
    default:
      return 'outline';
  }
}

export function TaskRow({ task }: { task: AnnotationTask }) {
  const { shortMonthYear: createdAt } = formatDate(task.createdAt);
  const { fullDateTime: updatedAt } = formatDate(task.updatedAt);
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
    <TableRow className="hover:bg-accent/30 h-16">
      <TableCell className="px-4 py-4 text-center align-middle">
        <Link
          href={'/annotate/' + task.id}
          className="text-foreground hover:text-primary inline-block max-w-full truncate hover:underline"
        >
          {task.title || 'Task #' + task.id}
        </Link>
      </TableCell>
      <TableCell className="px-4 py-4 text-center align-middle">
        <Badge variant={getBadgeVariantForTaskStatus(task.status)}>
          {task.status}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground px-4 py-4 text-center align-middle">
        {createdAt}
      </TableCell>
      <TableCell className="text-muted-foreground px-4 py-4 text-center align-middle">
        {updatedAt}
      </TableCell>
      <TableCell className="px-4 py-4 text-center align-middle">
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
      </TableCell>
    </TableRow>
  );
}
