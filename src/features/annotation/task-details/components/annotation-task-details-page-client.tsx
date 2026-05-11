'use client';

import type { AnnotationStatus } from '@/api/annotation/validation/annotation-schema';
import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { PencilRuler } from 'lucide-react';
import { useState } from 'react';
import AnnotationWorkspace from '@/features/annotation/task-details/components/workspace/annotation-workspace';
import AnnotationTaskDetailsHeader from '@/features/annotation/task-details/components/layout/annotation-task-details-header';

interface AnnotationTaskDetailsPageClientProps {
    taskId: number;
}

export default function AnnotationTaskDetailsPageClient({
    taskId,
}: AnnotationTaskDetailsPageClientProps) {
    const [status, setStatus] = useState<AnnotationStatus>('PENDING');
    const [page, setPage] = useState(1);

    function handleStatusChange(newStatus: AnnotationStatus) {
        setStatus(newStatus);
        setPage(1);
    }

    return (
        <PageShell
            title="Annotate Specimens"
            description="Review and annotate specimens for this task"
            icon={PencilRuler}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="p-6">
                    <AnnotationTaskDetailsHeader
                        status={status}
                        onStatusChange={handleStatusChange}
                    />

                    <AnnotationWorkspace
                        taskId={taskId}
                        status={status}
                        page={page}
                        onPageChange={setPage}
                    />
                </CardContent>
            </Card>
        </PageShell>
    );
}
