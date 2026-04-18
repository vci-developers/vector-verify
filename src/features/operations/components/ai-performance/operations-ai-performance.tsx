'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import { useGetAnnotationTasks } from '@/api/annotation-task/hooks/use-get-annotation-tasks';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { format } from 'date-fns';
import { Bot, Info } from 'lucide-react';

interface OperationsAiPerformanceProps {
    district: string;
    startDate: string;
    endDate: string;
}

const CONFUSION_MATRIX = [
    {
        label: 'An. gambiae s.s.',
        cells: [
            { value: '458', percent: '95%', className: 'bg-emerald-500 text-white' },
            { value: '12', percent: '2%', className: 'bg-rose-100 text-rose-700' },
            { value: '8', percent: '2%', className: 'bg-rose-50 text-rose-700' },
            { value: '5', percent: '1%', className: 'bg-rose-50 text-rose-700' },
        ],
    },
    {
        label: 'An. arabiensis',
        cells: [
            { value: '15', percent: '5%', className: 'bg-rose-300 text-rose-800' },
            { value: '256', percent: '89%', className: 'bg-emerald-500 text-white' },
            { value: '6', percent: '2%', className: 'bg-rose-200 text-rose-700' },
            { value: '10', percent: '3%', className: 'bg-rose-300 text-rose-800' },
        ],
    },
    {
        label: 'An. funestus',
        cells: [
            { value: '5', percent: '3%', className: 'bg-rose-200 text-rose-700' },
            { value: '8', percent: '6%', className: 'bg-rose-300 text-rose-800' },
            { value: '125', percent: '87%', className: 'bg-emerald-500 text-white' },
            { value: '5', percent: '3%', className: 'bg-rose-200 text-rose-700' },
        ],
    },
    {
        label: 'Culex sp.',
        cells: [
            { value: '8', percent: '9%', className: 'bg-rose-400 text-white' },
            { value: '11', percent: '13%', className: 'bg-rose-500 text-white' },
            { value: '4', percent: '5%', className: 'bg-rose-300 text-rose-800' },
            { value: '62', percent: '73%', className: 'bg-emerald-500 text-white' },
        ],
    },
] as const;

const CLASS_PERFORMANCE = [
    { label: 'An. gambiae s.s.', precision: '94.8%', recall: '97.2%' },
    { label: 'An. arabiensis', precision: '89.2%', recall: '91.5%' },
    { label: 'An. funestus', precision: '87.4%', recall: '90.3%' },
    { label: 'Culex sp.', precision: '72.9%', recall: '78.1%' },
] as const;

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

    if (isGetAnnotationsSummaryPending || isGetSpecimensCountPending) {
        return <p className="text-muted-foreground text-sm">Loading...</p>;
    }

    if (!getAnnotationsSummaryResult?.ok) {
        return (
            <p className="text-destructive text-sm">
                {getAnnotationsSummaryResult?.error.message ??
                    'Failed to load annotations summary.'}
            </p>
        );
    }

    if (!getSpecimensCountResult?.ok) {
        return (
            <p className="text-destructive text-sm">
                {getSpecimensCountResult?.error.message ??
                    'Failed to load specimens count.'}
            </p>
        );
    }

    const validatedSpecimens =
        getAnnotationsSummaryResult.data.statusCounts.ANNOTATED;

    const totalSpecimens = getSpecimensCountResult.data.data.reduce(
        (sum, d) => sum + d.totalSpecimens,
        0,
    );

    const coveragePercent =
        totalSpecimens > 0
            ? ((validatedSpecimens / totalSpecimens) * 100).toFixed(1)
            : null;

    const lastUpdateTimestamp =
        validatedSpecimens > 0 && getAnnotationTasksResult?.ok
            ? getAnnotationTasksResult.data.tasks
                  .filter(t => (t.annotationCounts?.annotated ?? 0) > 0)
                  .reduce<number | null>(
                      (max, t) =>
                          max === null || t.updatedAt > max ? t.updatedAt : max,
                      null,
                  )
            : null;

    const lastUpdateFormatted = lastUpdateTimestamp
        ? format(new Date(lastUpdateTimestamp), 'yyyy-MM-dd HH:mm')
        : null;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <Info className="h-4 w-4" />
                <span>Metrics reflect only expert-validated specimens</span>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Card className="gap-0 border-emerald-400/80 py-0 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Coverage & Validated Specimens
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {coveragePercent !== null
                                ? `${coveragePercent}%`
                                : '—'}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {validatedSpecimens.toLocaleString()} annotated /{' '}
                            {totalSpecimens.toLocaleString()} total specimens
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-border gap-0 py-0">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Last Update
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {lastUpdateFormatted ?? '—'}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            latest master VCO annotation
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">Confusion Matrix</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="max-w-3xl">
                        <Table className="w-full table-fixed border-collapse overflow-hidden rounded-lg">
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="bg-muted/40 h-12 w-1/5 border" />
                                    <TableHead
                                        className="bg-muted/40 h-12 border text-center font-semibold"
                                        colSpan={4}
                                    >
                                        AI Prediction
                                    </TableHead>
                                </TableRow>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-sm font-semibold">
                                        Ground Truth
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. gambiae s.s.
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. arabiensis
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        An. funestus
                                    </TableHead>
                                    <TableHead className="bg-muted/20 w-1/5 border text-center text-xs font-semibold">
                                        Culex sp.
                                    </TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {CONFUSION_MATRIX.map(row => (
                                    <TableRow
                                        key={row.label}
                                        className="hover:bg-transparent"
                                    >
                                        <TableCell className="bg-background border text-center text-xs font-medium">
                                            {row.label}
                                        </TableCell>
                                        {row.cells.map((cell, cellIndex) => (
                                            <TableCell
                                                key={`${row.label}-${cellIndex}`}
                                                className={`border p-0 ${cell.className}`}
                                            >
                                                <div className="flex min-h-18 flex-col items-center justify-center px-2 py-3 text-center">
                                                    <span className="text-base font-semibold">
                                                        {cell.value}
                                                    </span>
                                                    <span className="text-xs opacity-90">
                                                        {cell.percent}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                        <div className="space-y-3 rounded-xl border p-4">
                            <div className="flex items-center gap-2">
                                <Bot className="h-4 w-4" />
                                <h3 className="text-sm font-semibold">
                                    Per-Class Performance
                                </h3>
                            </div>
                            <div className="space-y-3">
                                {CLASS_PERFORMANCE.map(species => (
                                    <div
                                        key={species.label}
                                        className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 text-sm"
                                    >
                                        <span className="font-medium">
                                            {species.label}
                                        </span>
                                        <span className="text-muted-foreground text-right">
                                            P: {species.precision}
                                        </span>
                                        <span className="text-muted-foreground text-right">
                                            R: {species.recall}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3 rounded-xl border p-4">
                            <h3 className="text-sm font-semibold">
                                Interpretation
                            </h3>
                            <p className="text-muted-foreground text-sm leading-6">
                                The model performs strongly on the core
                                Anopheles classes, with the largest error
                                concentration in Culex predictions. This view is
                                intended as a quick operational snapshot while a
                                fuller metrics surface is still being built.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
