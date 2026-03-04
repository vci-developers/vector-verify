'use client';

import {
    annotationStatusSchema,
    type AnnotationStatus,
} from '@/api/annotation/validation/annotation-schema';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Link from 'next/link';

interface AnnotationTaskDetailsHeaderProps {
    status: AnnotationStatus;
    onStatusChange: (status: AnnotationStatus) => void;
}

export default function AnnotationTaskDetailsHeader({
    status,
    onStatusChange,
}: AnnotationTaskDetailsHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <Tabs
                value={status}
                onValueChange={value =>
                    onStatusChange(value as AnnotationStatus)
                }
            >
                <TabsList className="bg-muted/50 rounded-full p-1">
                    {annotationStatusSchema.options.map(statusOption => (
                        <TabsTrigger
                            key={statusOption}
                            value={statusOption}
                            className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground rounded-full px-4 py-2 text-sm font-medium"
                        >
                            {statusOption.replaceAll('_', ' ')}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>

            <Button variant="outline" size="lg" asChild>
                <Link href="/annotate_new">Exit</Link>
            </Button>
        </div>
    );
}
