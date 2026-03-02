'use client';

import type {
    AnnotationTask,
    AnnotationTaskStatus,
} from '@/api/annotation-task/validation/annotation-task-schema';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { format } from 'date-fns';
import { Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface AnnotationTaskCardProps {
    task: AnnotationTask;
}

const STATUS_VARIANT: Record<
    AnnotationTaskStatus,
    'default' | 'destructive' | 'outline'
> = {
    PENDING: 'destructive',
    IN_PROGRESS: 'outline',
    COMPLETED: 'default',
};

export default function AnnotationTaskCard({ task }: AnnotationTaskCardProps) {
    return (
        <Link href={`/annotate_new/${task.id}`} className="block">
            <Card className="group border-border/50 hover:border-primary/30 cursor-pointer overflow-hidden transition-all duration-200 hover:shadow-lg">
                <CardContent>
                    <div className="flex min-h-full gap-4">
                        <div className="flex-1 p-2">
                            <div className="flex items-center gap-3">
                                <Badge variant={STATUS_VARIANT[task.status]}>
                                    {task.status.replaceAll('_', ' ')}
                                </Badge>
                                {task.createdAt && (
                                    <div className="text-muted-foreground flex items-center gap-1.5 text-xs">
                                        <Calendar className="h-3 w-3" />
                                        <span>
                                            Assigned on:{' '}
                                            {format(
                                                new Date(task.createdAt),
                                                'MMM d, yyyy',
                                            )}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <h3 className="group-hover:text-primary mt-3 text-lg font-semibold transition-colors">
                                {task.title}
                            </h3>
                            <p className="text-muted-foreground mt-1 line-clamp-2 text-sm">
                                {task.description || 'No description provided'}
                            </p>

                            <div className="mt-4">
                                <div className="mb-1.5 flex items-center justify-between">
                                    <span className="text-muted-foreground text-xs">
                                        Progress
                                    </span>
                                    <span className="text-xs font-medium">
                                        {30}%
                                    </span>
                                </div>
                                <Progress value={30} className="h-2" />
                            </div>
                        </div>

                        <div className="bg-muted/70 group-hover:bg-primary/30 flex rounded-lg w-12 items-center justify-center transition-colors">
                            <ChevronRight className="text-muted-foreground group-hover:text-primary h-5 w-5 transition-colors" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
