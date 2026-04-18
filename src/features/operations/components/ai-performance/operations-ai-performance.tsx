'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { Card, CardContent } from '@/components/ui/card';
import OperationsAiPerformanceMatrix from '@/features/operations/components/ai-performance/operations-ai-performance-matrix';
import { format } from 'date-fns';
import { Info } from 'lucide-react';

interface OperationsAiPerformanceProps {
    district: string;
    startDate: string;
    endDate: string;
}

export default function OperationsAiPerformance({
    district,
    startDate,
    endDate,
}: OperationsAiPerformanceProps) {
    const {
        data: getAnnotationsSummaryResult,
        isPending: isGetAnnotationsSummaryPending,
    } = useGetAnnotationsSummary({ district, startDate, endDate });

    const {
        data: getSpecimensCountResult,
        isPending: isGetSpecimensCountPending,
    } = useGetSpecimensCount({ district, startDate, endDate });

    const { data: getAnnotationTasksResult } = useGetAnnotationTasks({
        startDate,
        endDate,
        limit: 100,
    });

    if (
        isGetAnnotationsSummaryPending ||
        isGetSpecimensCountPending ||
        !getAnnotationsSummaryResult ||
        !getSpecimensCountResult
    ) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    if (!getAnnotationsSummaryResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAnnotationsSummaryResult.error.message ??
                    'Failed to load annotations summary.'}
            </p>
        );
    }

    if (!getSpecimensCountResult.ok) {
        return (
            <p className="text-destructive text-sm">
                {getSpecimensCountResult.error.message ??
                    'Failed to load specimens count.'}
            </p>
        );
    }

    const validatedSpecimens =
        getAnnotationsSummaryResult.data.statusCounts.ANNOTATED;

    const totalSpecimens = getSpecimensCountResult.data.data.reduce(
        (sum, datum) => sum + datum.totalSpecimens,
        0,
    );

    const coveragePercent =
        totalSpecimens > 0
            ? ((validatedSpecimens / totalSpecimens) * 100).toFixed(1)
            : null;

    const lastUpdateTimestamp =
        validatedSpecimens > 0 && getAnnotationTasksResult?.ok
            ? getAnnotationTasksResult.data.tasks
                  .filter(task => (task.annotationCounts?.annotated ?? 0) > 0)
                  .reduce<
                      number | null
                  >((maxTimestamp, task) => (maxTimestamp === null || task.updatedAt > maxTimestamp ? task.updatedAt : maxTimestamp), null)
            : null;

    const lastUpdateFormatted = lastUpdateTimestamp
        ? format(new Date(lastUpdateTimestamp), 'yyyy-MM-dd HH:mm')
        : null;

    const summaryCards = [
        {
            label: 'Coverage',
            value: coveragePercent !== null ? `${coveragePercent}%` : '—',
            description: `${validatedSpecimens.toLocaleString()} annotated / ${totalSpecimens.toLocaleString()} total specimens`,
            className:
                'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
        },
        {
            label: 'Validated Specimens',
            value: validatedSpecimens.toLocaleString(),
            description: 'expert-validated specimens',
            className:
                'border-emerald-400/80 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]',
        },
        {
            label: 'Last Update',
            value: lastUpdateFormatted ?? '—',
            description: 'latest master VCO annotation',
            className: 'border-border',
        },
    ] as const;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <Info className="h-4 w-4" />
                <span>Metrics reflect only expert-validated specimens</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-4">
                {summaryCards.map(card => (
                    <Card
                        key={card.label}
                        className={`gap-0 py-0 ${card.className}`}
                    >
                        <CardContent className="p-4">
                            <p className="text-muted-foreground text-sm">
                                {card.label}
                            </p>
                            <p className="mt-1 text-4xl font-semibold tracking-tight">
                                {card.value}
                            </p>
                            <p className="text-muted-foreground mt-2 text-xs">
                                {card.description}
                            </p>
                        </CardContent>
                    </Card>
                ))}

                <OperationsAiPerformanceMatrix
                    district={district}
                    startDate={startDate}
                    endDate={endDate}
                />
            </div>
        </div>
    );
}
