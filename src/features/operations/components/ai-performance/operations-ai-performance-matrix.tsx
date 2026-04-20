'use client';

import { useGetAnnotationsSummary } from '@/api/annotation/hooks/use-get-annotations-summary';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Bot } from 'lucide-react';
import type { CSSProperties } from 'react';
import {
    buildSpeciesMatrixViewModel,
    type SpeciesMatrixViewModel,
} from '@/features/operations/utils/build-species-matrix-view-model';
import type { LocationQueryParam } from '@/lib/location/location-query';
import { cn } from '@/utils/cn';

interface OperationsAiPerformanceMatrixProps {
    locationQueryParam: LocationQueryParam;
    startDate: string;
    endDate: string;
}

const numberFormatter = new Intl.NumberFormat('en-US');

const MATRIX_CELL_STYLE = {
    diagonal: {
        baseAlpha: 0.14,
        alphaRange: 0.78,
        highContrastTextThreshold: 0.52,
    },
    offDiagonal: {
        baseAlpha: 0.06,
        alphaRange: 0.5,
        emphasizedTextThreshold: 0.2,
    },
} as const;

function formatPercent(value: number | null) {
    if (value === null) return '—';
    return `${(value * 100).toFixed(1)}%`;
}

function getHeatmapBackgroundColor(
    colorVariable: '--success' | '--destructive',
    opacity: number,
) {
    return `color-mix(in srgb, var(${colorVariable}) ${opacity * 100}%, transparent)`;
}

function getMatrixCellPresentation(
    ratio: number | null,
    isDiagonal: boolean,
): { className: string; style?: CSSProperties } {
    if (ratio === null) {
        return {
            className: 'bg-muted text-muted-foreground',
        };
    }

    if (isDiagonal) {
        const opacity =
            MATRIX_CELL_STYLE.diagonal.baseAlpha +
            ratio * MATRIX_CELL_STYLE.diagonal.alphaRange;

        return {
            className:
                ratio >= MATRIX_CELL_STYLE.diagonal.highContrastTextThreshold
                    ? 'text-success-foreground'
                    : 'text-success',
            style: {
                backgroundColor: getHeatmapBackgroundColor(
                    '--success',
                    opacity,
                ),
            },
        };
    }

    const opacity =
        MATRIX_CELL_STYLE.offDiagonal.baseAlpha +
        ratio * MATRIX_CELL_STYLE.offDiagonal.alphaRange;

    return {
        className:
            ratio >= MATRIX_CELL_STYLE.offDiagonal.emphasizedTextThreshold
                ? 'text-destructive'
                : 'text-destructive/80',
        style: {
            backgroundColor: getHeatmapBackgroundColor(
                '--destructive',
                opacity,
            ),
        },
    };
}

function AccuracyCard({
    speciesMatrix,
}: {
    speciesMatrix: SpeciesMatrixViewModel | null;
}) {
    return (
        <Card className="gap-0 border-sky-300/80 py-0 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.12)]">
            <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">Accuracy</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">
                    {formatPercent(speciesMatrix?.accuracy ?? null)}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                    {speciesMatrix
                        ? `${numberFormatter.format(speciesMatrix.correctCount)} correct of ${numberFormatter.format(speciesMatrix.totalCount)} species comparisons`
                        : 'From species confusion matrix'}
                </p>
            </CardContent>
        </Card>
    );
}

function MatrixCard({
    speciesMatrix,
}: {
    speciesMatrix: SpeciesMatrixViewModel;
}) {
    return (
        <Card className="gap-0 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="max-w-full">
                    <Table className="min-w-[720px] table-fixed border-collapse overflow-hidden rounded-lg">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-muted/40 h-12 w-60 border" />
                                <TableHead
                                    className="bg-muted/40 h-12 border text-center font-semibold"
                                    colSpan={speciesMatrix.columns.length}
                                >
                                    AI Prediction
                                </TableHead>
                            </TableRow>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-muted/20 border text-center text-sm font-semibold">
                                    Ground Truth
                                </TableHead>
                                {speciesMatrix.columns.map(label => (
                                    <TableHead
                                        key={label}
                                        className="bg-muted/20 border px-2 text-center text-xs font-semibold"
                                    >
                                        <span className="line-clamp-2 whitespace-normal">
                                            {label}
                                        </span>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {speciesMatrix.rows.map(row => (
                                <TableRow
                                    key={row.label}
                                    className="hover:bg-transparent"
                                >
                                    <TableCell className="bg-background border text-center text-xs font-medium whitespace-normal">
                                        {row.label}
                                    </TableCell>
                                    {row.cells.map((cell, cellIndex) => {
                                        const cellPresentation =
                                            getMatrixCellPresentation(
                                                cell.ratio,
                                                cell.isDiagonal,
                                            );

                                        return (
                                            <TableCell
                                                key={`${row.label}-${speciesMatrix.columns[cellIndex] ?? cellIndex}`}
                                                className={cn(
                                                    'border p-0',
                                                    cellPresentation.className,
                                                )}
                                                style={cellPresentation.style}
                                            >
                                                <div className="flex min-h-20 flex-col items-center justify-center px-2 py-3 text-center">
                                                    <span className="text-base font-semibold">
                                                        {numberFormatter.format(
                                                            cell.count,
                                                        )}
                                                    </span>
                                                    <span className="text-xs opacity-90">
                                                        {formatPercent(
                                                            cell.ratio,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        );
                                    })}
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
                            {speciesMatrix.classPerformance.map(species => (
                                <div
                                    key={species.label}
                                    className="grid grid-cols-[minmax(0,1fr)_88px_88px] items-center gap-3 text-sm"
                                >
                                    <span className="font-medium">
                                        {species.label}
                                    </span>
                                    <span className="text-muted-foreground text-right">
                                        P: {formatPercent(species.precision)}
                                    </span>
                                    <span className="text-muted-foreground text-right">
                                        R: {formatPercent(species.recall)}
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
                            The confusion matrix compares expert-validated
                            mosquito species against the AI prediction for the
                            selected location. Each cell shows the specimen
                            count and that cell&apos;s share of the true-species
                            row.
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            Precision indicates how reliable each predicted
                            species label is. Recall indicates how often the AI
                            correctly recovers each true species.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}

function MatrixLoadingState() {
    return (
        <Card className="gap-0 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                    Loading species confusion matrix...
                </div>
            </CardContent>
        </Card>
    );
}

function MatrixErrorState({ message }: { message: string }) {
    return (
        <Card className="gap-0 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="border-destructive/20 bg-destructive/10 text-destructive rounded-lg border px-4 py-3 text-sm">
                    {message}
                </div>
            </CardContent>
        </Card>
    );
}

function MatrixEmptyState() {
    return (
        <Card className="gap-0 lg:col-span-4">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-muted-foreground rounded-lg border border-dashed px-4 py-8 text-center text-sm">
                    No species confusion matrix is available for this location
                    and date range.
                </div>
            </CardContent>
        </Card>
    );
}

export default function OperationsAiPerformanceMatrix({
    locationQueryParam,
    startDate,
    endDate,
}: OperationsAiPerformanceMatrixProps) {
    const {
        data: getAnnotationsSummaryResult,
        isPending: isGetAnnotationsSummaryPending,
        isError: isGetAnnotationsSummaryError,
    } = useGetAnnotationsSummary({
        ...locationQueryParam,
        startDate,
        endDate,
    });

    if (isGetAnnotationsSummaryPending || !getAnnotationsSummaryResult) {
        return (
            <>
                <AccuracyCard speciesMatrix={null} />
                <MatrixLoadingState />
            </>
        );
    }

    if (isGetAnnotationsSummaryError || !getAnnotationsSummaryResult.ok) {
        return (
            <>
                <AccuracyCard speciesMatrix={null} />
                <MatrixErrorState
                    message={
                        getAnnotationsSummaryResult.ok
                            ? 'Unable to load the species confusion matrix.'
                            : (getAnnotationsSummaryResult.error.message ??
                              'Unable to load the species confusion matrix.')
                    }
                />
            </>
        );
    }

    const speciesMatrix = buildSpeciesMatrixViewModel(
        getAnnotationsSummaryResult.data.confusionMatrices?.species,
    );

    if (!speciesMatrix) {
        return (
            <>
                <AccuracyCard speciesMatrix={null} />
                <MatrixEmptyState />
            </>
        );
    }

    return (
        <>
            <AccuracyCard speciesMatrix={speciesMatrix} />
            <MatrixCard speciesMatrix={speciesMatrix} />
        </>
    );
}
