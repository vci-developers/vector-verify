import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TableCell, TableRow } from '@/components/ui/table';
import { useAnnotationTaskProgressQuery } from '@/lib/annotate/client';
import {
  AnnotationTask,
  AnnotationTaskStatus,
} from '@/lib/entities/annotation';
import { formatDate } from '@/lib/shared/utils/date';
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
  const progress = progressData?.percent ?? 0;

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
        <div className="mx-auto flex max-w-[280px] items-center justify-center gap-3">
          <div className="flex-1">
            <Progress className="w-full" value={progress} />
          </div>
          <span className="text-muted-foreground min-w-8 text-center text-xs font-medium">
            {progress}%
          </span>
        </div>
      </TableCell>
    </TableRow>
  );
}
