'use client';

import type { AnnotationTaskStatus } from '@/api/annotation-task/validation/annotation-task-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';
import { useState } from 'react';
import type { DateRange } from 'react-day-picker';
import AnnotationTasksFilters from './annotation-tasks-filters';
import AnnotationTasksList from './annotation-tasks-list';

export default function AnnotationTasksListClient() {
    const [dateRange, setDateRange] = useState<DateRange | undefined>(
        undefined,
    );
    const [status, setStatus] = useState<AnnotationTaskStatus>('PENDING');

    const startDate = dateRange?.from?.toISOString();
    const endDate = dateRange?.to?.toISOString();

    return (
        <PageShell
            title="Annotation Tasks"
            description="Review and annotate pending specimens"
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    <AnnotationTasksFilters
                        status={status}
                        dateRange={dateRange}
                        onStatusChange={setStatus}
                        onDateRangeChange={setDateRange}
                        onClearDateRange={() => setDateRange(undefined)}
                    />

                    <div className="border-border/50 border-t" />

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
