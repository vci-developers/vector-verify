'use client';

import type { AnnotationConfusionMatrix } from '@/api/annotation/validation/get-annotations-summary-schema';
import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import { useGetSpecimensCount } from '@/api/specimen/hooks/use-get-specimens-count';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Bot, Info, Target } from 'lucide-react';
import type { CSSProperties } from 'react';

interface OperationsAiPerformanceTabProps {
    district: string;
    startDate: string;
    endDate: string;
}

interface HeatmapCell {
    count: number;
    ratio: number | null;
    isDiagonal: boolean;
}

interface HeatmapRow {
    label: string;
    cells: HeatmapCell[];
}

interface PerClassMetric {
    label: string;
    support: number;
    predicted: number;
    truePositive: number;
    precision: number | null;
    recall: number | null;
    f1: number | null;
}

interface TopConfusion {
    from: string;
    to: string;
    count: number;
    rowShare: number | null;
}

interface SpeciesPerformance {
    labels: string[];
    recallRows: HeatmapRow[];
    precisionRows: HeatmapRow[];
    perClass: PerClassMetric[];
    total: number;
    overallAccuracy: number | null;
    macroPrecision: number | null;
    macroRecall: number | null;
    macroF1: number | null;
    topConfusion: TopConfusion | null;
}

interface MatrixHeatmapProps {
    title: string;
    description: string;
    labels: string[];
    rows: HeatmapRow[];
}

const numberFormatter = new Intl.NumberFormat('en-US');

function average(values: number[]) {
    if (values.length === 0) return null;
    return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function formatPercent(value: number | null) {
    if (value === null) return '—';
    return `${(value * 100).toFixed(1)}%`;
}

function getHeatmapCellStyle(
    ratio: number | null,
    isDiagonal: boolean,
): CSSProperties {
    if (ratio === null) {
        return {
            backgroundColor: 'rgba(148, 163, 184, 0.08)',
            color: 'rgb(51, 65, 85)',
        };
    }

    const alpha = ratio === 0 ? 0.06 : 0.16 + ratio * 0.72;
    const backgroundColor = isDiagonal
        ? `rgba(8, 145, 178, ${Math.min(alpha + 0.06, 0.96)})`
        : `rgba(37, 99, 235, ${Math.min(alpha, 0.9)})`;

    return {
        backgroundColor,
        color: ratio >= 0.52 ? 'white' : 'rgb(15, 23, 42)',
    };
}

function buildSpeciesPerformance(
    matrix?: AnnotationConfusionMatrix,
): SpeciesPerformance | null {
    if (!matrix) return null;

    const labels = [
        ...new Set([
            ...matrix.columns,
            ...matrix.data.map(row => row.rowLabel),
        ]),
    ].filter(label => label.trim().length > 0);

    if (labels.length === 0) return null;

    const rowsByLabel = new Map(matrix.data.map(row => [row.rowLabel, row]));
    const counts = labels.map(rowLabel =>
        labels.map(columnLabel => {
            const value = rowsByLabel.get(rowLabel)?.values[columnLabel];
            if (typeof value !== 'number' || Number.isNaN(value) || value < 0) {
                return 0;
            }
            return value;
        }),
    );

    const rowTotals = counts.map(row =>
        row.reduce((sum, value) => sum + value, 0),
    );
    const columnTotals = labels.map((_, columnIndex) =>
        counts.reduce((sum, row) => sum + (row[columnIndex] ?? 0), 0),
    );
    const total = rowTotals.reduce((sum, value) => sum + value, 0);
    const diagonalTotal = counts.reduce(
        (sum, row, rowIndex) => sum + (row[rowIndex] ?? 0),
        0,
    );

    let topConfusion: TopConfusion | null = null;

    const recallRows = labels.map((label, rowIndex) => ({
        label,
        cells: labels.map((_, columnIndex) => {
            const count = counts[rowIndex]?.[columnIndex] ?? 0;
            const ratio =
                (rowTotals[rowIndex] ?? 0) > 0
                    ? count / (rowTotals[rowIndex] ?? 0)
                    : null;

            if (rowIndex !== columnIndex && count > 0) {
                const nextCandidate: TopConfusion = {
                    from: label,
                    to: labels[columnIndex] ?? label,
                    count,
                    rowShare: ratio,
                };

                if (
                    topConfusion === null ||
                    nextCandidate.count > topConfusion.count
                ) {
                    topConfusion = nextCandidate;
                }
            }

            return {
                count,
                ratio,
                isDiagonal: rowIndex === columnIndex,
            };
        }),
    }));

    const precisionRows = labels.map((label, rowIndex) => ({
        label,
        cells: labels.map((_, columnIndex) => {
            const count = counts[rowIndex]?.[columnIndex] ?? 0;
            const predictedTotal = columnTotals[columnIndex] ?? 0;

            return {
                count,
                ratio: predictedTotal > 0 ? count / predictedTotal : null,
                isDiagonal: rowIndex === columnIndex,
            };
        }),
    }));

    const perClass = labels.map((label, index) => {
        const truePositive = counts[index]?.[index] ?? 0;
        const predictedTotal = columnTotals[index] ?? 0;
        const supportTotal = rowTotals[index] ?? 0;
        const precision =
            predictedTotal > 0 ? truePositive / predictedTotal : null;
        const recall = supportTotal > 0 ? truePositive / supportTotal : null;
        const f1 =
            precision === null || recall === null
                ? null
                : precision + recall === 0
                  ? 0
                  : (2 * precision * recall) / (precision + recall);

        return {
            label,
            support: supportTotal,
            predicted: predictedTotal,
            truePositive,
            precision,
            recall,
            f1,
        };
    });

    return {
        labels,
        recallRows,
        precisionRows,
        perClass,
        total,
        overallAccuracy: total > 0 ? diagonalTotal / total : null,
        macroPrecision: average(
            perClass.flatMap(metric =>
                metric.precision === null ? [] : [metric.precision],
            ),
        ),
        macroRecall: average(
            perClass.flatMap(metric =>
                metric.recall === null ? [] : [metric.recall],
            ),
        ),
        macroF1: average(
            perClass.flatMap(metric => (metric.f1 === null ? [] : [metric.f1])),
        ),
        topConfusion,
    };
}

function MatrixHeatmap({
    title,
    description,
    labels,
    rows,
}: MatrixHeatmapProps) {
    return (
        <div className="space-y-3 rounded-xl border p-4">
            <div className="space-y-1">
                <h3 className="text-sm font-semibold">{title}</h3>
                <p className="text-muted-foreground text-sm leading-5">
                    {description}
                </p>
            </div>

            <Table className="min-w-[720px] table-fixed border-collapse overflow-hidden rounded-lg">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted/40 h-12 w-36 border" />
                        <TableHead
                            className="bg-muted/40 h-12 border text-center font-semibold"
                            colSpan={labels.length}
                        >
                            Predicted species
                        </TableHead>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted/20 border text-center text-sm font-semibold">
                            True species
                        </TableHead>
                        {labels.map(label => (
                            <TableHead
                                key={`${title}-${label}`}
                                className="bg-muted/20 border px-1 text-center text-xs font-semibold"
                            >
                                <span className="line-clamp-2 whitespace-normal">
                                    {label}
                                </span>
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map(row => (
                        <TableRow key={`${title}-${row.label}`}>
                            <TableCell className="bg-background border text-center text-xs font-medium whitespace-normal">
                                {row.label}
                            </TableCell>
                            {row.cells.map((cell, cellIndex) => (
                                <TableCell
                                    key={`${title}-${row.label}-${labels[cellIndex]}`}
                                    className="border p-0"
                                    style={getHeatmapCellStyle(
                                        cell.ratio,
                                        cell.isDiagonal,
                                    )}
                                >
                                    <div className="flex min-h-20 flex-col items-center justify-center px-2 py-3 text-center">
                                        <span className="text-base font-semibold">
                                            {numberFormatter.format(cell.count)}
                                        </span>
                                        <span className="text-xs opacity-90">
                                            {formatPercent(cell.ratio)}
                                        </span>
                                    </div>
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
}

export default function OperationsAiPerformanceTab({
    district,
    startDate,
    endDate,
}: OperationsAiPerformanceTabProps) {
    const {
        data: summaryResult,
        isPending: isSummaryPending,
    } = useGetAnnotationsSummary({
        district,
        startDate,
        endDate,
    });
    const { data: specimensCountResult, isPending: isSpecimensCountPending } =
        useGetSpecimensCount({
            district,
            startDate,
            endDate,
        });

    const validatedSpecimens =
        summaryResult?.ok ? summaryResult.data.statusCounts.ANNOTATED : null;
    const speciesPerformance =
        summaryResult?.ok
            ? buildSpeciesPerformance(summaryResult.data.confusionMatrices?.species)
            : null;
    const comparedSpecimens = speciesPerformance?.total ?? null;
    const totalSpecimens =
        specimensCountResult?.ok
            ? specimensCountResult.data.data.reduce(
                  (sum, datum) => sum + datum.totalSpecimens,
                  0,
              )
            : null;
    const coveragePercent =
        validatedSpecimens !== null &&
        totalSpecimens !== null &&
        totalSpecimens > 0
            ? validatedSpecimens / totalSpecimens
            : null;

    const errorMessage =
        summaryResult && !summaryResult.ok
            ? (summaryResult.error.message ?? 'Unable to load AI performance.')
            : specimensCountResult && !specimensCountResult.ok
              ? (specimensCountResult.error.message ??
                  'Unable to load specimen coverage.')
              : null;

    const isLoading = isSummaryPending || isSpecimensCountPending;

    return (
        <div className="space-y-4">
            <div className="flex items-center gap-2 rounded-lg border border-sky-100 bg-sky-50 px-4 py-3 text-sm font-medium text-sky-700">
                <Info className="h-4 w-4" />
                <span>
                    Metrics reflect expert-validated mosquito species in the
                    selected district and date range.
                </span>
            </div>

            <div className="grid gap-3 lg:grid-cols-3">
                <Card className="gap-0 border-emerald-400/80 py-0 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">Coverage</p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {formatPercent(coveragePercent)}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {validatedSpecimens !== null
                                ? `${numberFormatter.format(validatedSpecimens)} validated specimens`
                                : isLoading
                                  ? 'Loading validated specimen coverage...'
                                  : 'Validated specimen coverage unavailable'}
                            {totalSpecimens !== null
                                ? ` of ${numberFormatter.format(totalSpecimens)} total`
                                : ''}
                        </p>
                    </CardContent>
                </Card>

                <Card className="gap-0 border-emerald-400/80 py-0 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.12)]">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Overall Species Accuracy
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {formatPercent(speciesPerformance?.overallAccuracy ?? null)}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {comparedSpecimens !== null
                                ? `${numberFormatter.format(comparedSpecimens)} expert-validated species comparisons`
                                : isLoading
                                  ? 'Loading district-specific species comparisons...'
                                  : 'No species comparisons in this district'}
                        </p>
                    </CardContent>
                </Card>

                <Card className="gap-0 py-0">
                    <CardContent className="p-4">
                        <p className="text-muted-foreground text-sm">
                            Macro F1
                        </p>
                        <p className="mt-1 text-4xl font-semibold tracking-tight">
                            {formatPercent(speciesPerformance?.macroF1 ?? null)}
                        </p>
                        <p className="text-muted-foreground mt-2 text-xs">
                            {speciesPerformance !== null
                                ? `${speciesPerformance.perClass.length} species labels evaluated`
                                : isLoading
                                  ? 'Loading class-level performance...'
                                  : 'Class-level performance unavailable'}
                        </p>
                    </CardContent>
                </Card>
            </div>

            <Card className="gap-0">
                <CardHeader className="pb-2">
                    <CardTitle className="text-xl">
                        Species Confusion Matrix
                    </CardTitle>
                    <CardDescription>
                        District-specific mosquito species identification
                        performance derived from `/annotations/summary`.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {errorMessage ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                            {errorMessage}
                        </div>
                    ) : isLoading ? (
                        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                            Loading AI performance for {district}...
                        </div>
                    ) : !speciesPerformance || speciesPerformance.total === 0 ? (
                        <div className="rounded-lg border border-dashed px-4 py-8 text-center text-sm text-slate-500">
                            No expert-validated species confusion matrix is
                            available for {district} in this date range.
                        </div>
                    ) : (
                        <>
                            <div className="grid gap-4 xl:grid-cols-2">
                                <MatrixHeatmap
                                    title="Recall"
                                    description="Row-normalized by true species. Diagonal cells show how often each true species was correctly recovered."
                                    labels={speciesPerformance.labels}
                                    rows={speciesPerformance.recallRows}
                                />
                                <MatrixHeatmap
                                    title="Precision"
                                    description="Column-normalized by predicted species. Diagonal cells show how reliable each predicted species is."
                                    labels={speciesPerformance.labels}
                                    rows={speciesPerformance.precisionRows}
                                />
                            </div>

                            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_320px]">
                                <div className="space-y-3 rounded-xl border p-4">
                                    <div className="flex items-center gap-2">
                                        <Bot className="h-4 w-4" />
                                        <h3 className="text-sm font-semibold">
                                            Per-Class Performance
                                        </h3>
                                    </div>

                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead>Species</TableHead>
                                                <TableHead className="text-right">
                                                    Support
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Precision
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    Recall
                                                </TableHead>
                                                <TableHead className="text-right">
                                                    F1
                                                </TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {speciesPerformance.perClass.map(
                                                metric => (
                                                    <TableRow key={metric.label}>
                                                        <TableCell className="font-medium whitespace-normal">
                                                            {metric.label}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {numberFormatter.format(
                                                                metric.support,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(
                                                                metric.precision,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(
                                                                metric.recall,
                                                            )}
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            {formatPercent(
                                                                metric.f1,
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                ),
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                <div className="space-y-3 rounded-xl border p-4">
                                    <div className="flex items-center gap-2">
                                        <Target className="h-4 w-4" />
                                        <h3 className="text-sm font-semibold">
                                            Interpretation
                                        </h3>
                                    </div>
                                    <p className="text-muted-foreground text-sm leading-6">
                                        {district} has an overall species
                                        accuracy of{' '}
                                        {formatPercent(
                                            speciesPerformance.overallAccuracy,
                                        )}{' '}
                                        across{' '}
                                        {numberFormatter.format(
                                            speciesPerformance.total,
                                        )}{' '}
                                        expert-validated mosquito specimens.
                                        Macro precision is{' '}
                                        {formatPercent(
                                            speciesPerformance.macroPrecision,
                                        )}{' '}
                                        and macro recall is{' '}
                                        {formatPercent(
                                            speciesPerformance.macroRecall,
                                        )}
                                        .
                                    </p>
                                    <p className="text-muted-foreground text-sm leading-6">
                                        Recall answers whether the model finds
                                        each true mosquito species reliably.
                                        Precision answers whether a predicted
                                        mosquito species can be trusted when the
                                        AI makes that call.
                                    </p>
                                    {speciesPerformance.topConfusion ? (
                                        <p className="text-muted-foreground text-sm leading-6">
                                            The largest confusion in this
                                            district is{' '}
                                            {numberFormatter.format(
                                                speciesPerformance.topConfusion
                                                    .count,
                                            )}{' '}
                                            specimens of{' '}
                                            {
                                                speciesPerformance.topConfusion
                                                    .from
                                            }{' '}
                                            predicted as{' '}
                                            {
                                                speciesPerformance.topConfusion
                                                    .to
                                            }
                                            {' ('}
                                            {formatPercent(
                                                speciesPerformance.topConfusion
                                                    .rowShare,
                                            )}
                                            {' of that true-species row).'}
                                        </p>
                                    ) : null}
                                </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
