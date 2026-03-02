'use client';

import PageShell from '@/components/layout/page-shell';
import { Card, CardContent } from '@/components/ui/card';
import { ClipboardList } from 'lucide-react';

interface AnnotationTasksListShellProps {
    children: React.ReactNode;
}

export default function AnnotationTasksListShell({
    children,
}: AnnotationTasksListShellProps) {
    return (
        <PageShell
            title="Annotation Tasks"
            description="Review and annotate pending specimens"
            icon={ClipboardList}
        >
            <Card className="border-border/50 bg-card/50 shadow-lg backdrop-blur-sm">
                <CardContent className="space-y-4 p-6">
                    {children}
                </CardContent>
            </Card>
        </PageShell>
    );
}
