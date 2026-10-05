'use client';

import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import type { AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import type { DateRange } from 'react-day-picker';

interface AnnotationTaskStatusCountProps {
    status: AnnotationTaskStatus;
    dateRange: DateRange | undefined;
}

export default function AnnotationTaskStatusCount({
    status,
    dateRange,
}: AnnotationTaskStatusCountProps) {
    const { data: getAnnotationTasksResult } = useGetAnnotationTasks({
        status,
        ...(dateRange?.from && {
            startDate: format(dateRange.from, 'yyyy-MM-dd'),
        }),
        ...(dateRange?.to && { endDate: format(dateRange.to, 'yyyy-MM-dd') }),
        page: 1,
        limit: 1,
    });

    if (!getAnnotationTasksResult?.ok) return null;

    return (
        <Badge
            variant="outline"
            className="ml-1.5 border-transparent bg-current/15 text-inherit tabular-nums"
        >
            {getAnnotationTasksResult.data.total}
        </Badge>
    );
}
