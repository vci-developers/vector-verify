'use client';

import type { AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { PencilRuler } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import AnnotationTasksListHeader from '@/features/annotation/tasks-list/components/layout/annotation-tasks-list-header';
import AnnotationTasksList from '@/features/annotation/tasks-list/components/tasks/annotation-tasks-list';
import { format } from 'date-fns';
import { Separator } from '@/components/ui/separator';

export default function AnnotationTasksListPageClient() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
    const [status, setStatus] = useState<AnnotationTaskStatus>('PENDING');

    const startDate = dateRange?.from
        ? format(dateRange?.from, 'yyyy-MM-dd')
        : undefined;
    const endDate = dateRange?.to
        ? format(dateRange?.to, 'yyyy-MM-dd')
        : undefined;

    return (
        <PageShell
            title="Annotation Tasks"
            description="Review and annotate pending specimens"
            icon={PencilRuler}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <AnnotationTasksListHeader
                        status={status}
                        dateRange={dateRange}
                        onStatusChange={setStatus}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                    />

                    <Separator />

                    <AnnotationTasksList
                        status={status}
                        startDate={startDate}
                        endDate={endDate}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
