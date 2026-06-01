import type { AnnotationConfusionMatrix } from '@/api/annotation/validation/get-annotations-summary-schema';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
    formatMatrixPercentage,
    getMatrixCellPresentation,
    integerCountFormatter,
} from '../utils/ai-performance-helpers';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { cn } from '@/utils/cn';
import { Bot } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface SpecimenConfusionMatrixProps {
    title: string;
    classificationCategory: string;
    groundTruthAxisLabel: string;
    predictionAxisLabel: string;
    confusionMatrix: AnnotationConfusionMatrix;
    selectedLocationName: string;
}

export default function SpecimenConfusionMatrix({
    title,
    classificationCategory,
    groundTruthAxisLabel,
    predictionAxisLabel,
    confusionMatrix,
    selectedLocationName,
}: SpecimenConfusionMatrixProps) {
    const t = useTranslations('OperationsAIPerformance');

    const classLabels = Array.from(
        new Set([
            ...confusionMatrix.columns,
            ...confusionMatrix.data.map(({ rowLabel }) => rowLabel),
        ]),
    );

    function getSpecimenCountForCell(
        groundTruthLabel: string,
        predictedLabel: string,
    ) {
        const specimenCount = confusionMatrix.data.find(
            row => row.rowLabel === groundTruthLabel,
        )?.values[predictedLabel];

        return specimenCount !== undefined &&
            Number.isFinite(specimenCount) &&
            specimenCount >= 0
            ? specimenCount
            : 0;
    }

    function getSpecimenCountForGroundTruthLabel(
        groundTruthLabel: string,
        labels = classLabels,
    ) {
        return labels.reduce(
            (totalSpecimens, predictedLabel) =>
                totalSpecimens +
                getSpecimenCountForCell(groundTruthLabel, predictedLabel),
            0,
        );
    }

    function getSpecimenCountForPredictedLabel(
        predictedLabel: string,
        labels = classLabels,
    ) {
        return labels.reduce(
            (totalSpecimens, groundTruthLabel) =>
                totalSpecimens +
                getSpecimenCountForCell(groundTruthLabel, predictedLabel),
            0,
        );
    }

    const totalSpecimensInMatrix = classLabels.reduce(
        (totalSpecimens, groundTruthLabel) =>
            totalSpecimens +
            getSpecimenCountForGroundTruthLabel(groundTruthLabel),
        0,
    );

    const totalCorrectPredictions = classLabels.reduce(
        (totalSpecimens, classLabel) =>
            totalSpecimens + getSpecimenCountForCell(classLabel, classLabel),
        0,
    );

    const accuracy =
        totalSpecimensInMatrix > 0
            ? totalCorrectPredictions / totalSpecimensInMatrix
            : null;

    const EXCLUDED_LABELS = ['UNKNOWN', 'Cannot be Determined'] as const;
    const excludedSpecimenCounts = EXCLUDED_LABELS.map(label =>
        getSpecimenCountForGroundTruthLabel(label),
    );

    const filteredClassLabels = classLabels.filter(
        label => !(EXCLUDED_LABELS as readonly string[]).includes(label),
    );

    const filteredTotalSpecimens = filteredClassLabels.reduce(
        (totalSpecimens, classLabel) => {
            return (
                totalSpecimens +
                getSpecimenCountForGroundTruthLabel(
                    classLabel,
                    filteredClassLabels,
                )
            );
        },
        0,
    );

    return (
        <Card className="gap-0 lg:col-span-2">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">{title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-6">
                <div className="border-secondary/30 bg-secondary/5 rounded-lg border p-4">
                    <p className="text-muted-foreground text-sm">
                        {t('accuracy')}
                    </p>
                    <p className="mt-1 text-4xl font-semibold tracking-tight">
                        {formatMatrixPercentage(accuracy)}
                    </p>
                    <p className="text-muted-foreground mt-2 text-xs">
                        {t('correctOf', {
                            numCorrect: integerCountFormatter.format(
                                totalCorrectPredictions,
                            ),
                            total: integerCountFormatter.format(
                                totalSpecimensInMatrix,
                            ),
                            category: classificationCategory,
                        })}
                    </p>
                </div>

                <div className="max-w-full">
                    <Table className="min-w-180 table-fixed border-collapse overflow-hidden rounded-lg">
                        <TableHeader>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-muted/40 h-12 w-60 border" />
                                <TableHead
                                    className="bg-muted/40 h-auto min-h-12 border px-3 py-3 text-center leading-snug font-semibold wrap-break-word whitespace-normal"
                                    colSpan={classLabels.length}
                                >
                                    {predictionAxisLabel}
                                </TableHead>
                            </TableRow>
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="bg-muted/20 h-auto border px-3 py-3 text-center text-sm leading-snug font-semibold wrap-break-word whitespace-normal">
                                    {groundTruthAxisLabel}
                                </TableHead>
                                {classLabels.map(predictedLabel => (
                                    <TableHead
                                        key={predictedLabel}
                                        className="bg-muted/20 border px-2 text-center text-xs font-semibold"
                                    >
                                        <span className="line-clamp-2 whitespace-normal">
                                            {predictedLabel}
                                        </span>
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody>
                            {classLabels.map(groundTruthLabel => {
                                const groundTruthLabelTotal =
                                    getSpecimenCountForGroundTruthLabel(
                                        groundTruthLabel,
                                    );

                                return (
                                    <TableRow
                                        key={groundTruthLabel}
                                        className="hover:bg-transparent"
                                    >
                                        <TableCell className="bg-background border text-center text-xs font-medium whitespace-normal">
                                            {groundTruthLabel}
                                        </TableCell>

                                        {classLabels.map(predictedLabel => {
                                            const specimenCountForCell =
                                                getSpecimenCountForCell(
                                                    groundTruthLabel,
                                                    predictedLabel,
                                                );
                                            const groundTruthLabelShare =
                                                groundTruthLabelTotal > 0
                                                    ? specimenCountForCell /
                                                      groundTruthLabelTotal
                                                    : null;
                                            const isCorrectPrediction =
                                                groundTruthLabel ===
                                                predictedLabel;
                                            const cellPresentation =
                                                getMatrixCellPresentation(
                                                    groundTruthLabelShare,
                                                    isCorrectPrediction,
                                                );

                                            return (
                                                <TableCell
                                                    key={`${groundTruthLabel}-${predictedLabel}`}
                                                    className={cn(
                                                        'border p-0',
                                                        cellPresentation.className,
                                                    )}
                                                    style={
                                                        cellPresentation.style
                                                    }
                                                >
                                                    <div className="flex min-h-20 items-center justify-center px-2 py-3 text-center">
                                                        <span className="text-base font-semibold">
                                                            {integerCountFormatter.format(
                                                                specimenCountForCell,
                                                            )}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                );
                            })}
                        </TableBody>
                    </Table>
                </div>

                <div className="grid items-stretch gap-4 lg:grid-cols-[500px_minmax(0,1fr)]">
                    <div className="h-full space-y-3 rounded-xl border p-4">
                        <div className="flex items-center gap-2">
                            <Bot className="h-4 w-4" />
                            <h3 className="text-sm font-semibold">
                                {t('perLabelMetrics')}
                            </h3>
                        </div>

                        <Table>
                            <TableHeader>
                                <TableRow className="hover:bg-transparent">
                                    <TableHead className="w-full">
                                        {t('label')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('sensitivity')}
                                    </TableHead>
                                    <TableHead className="text-right">
                                        {t('specificity')}
                                    </TableHead>
                                </TableRow>
                            </TableHeader>

                            <TableBody>
                                {filteredClassLabels.map(classLabel => {
                                    const truePositives =
                                        getSpecimenCountForCell(
                                            classLabel,
                                            classLabel,
                                        );
                                    const falseNegatives =
                                        getSpecimenCountForGroundTruthLabel(
                                            classLabel,
                                            filteredClassLabels,
                                        ) - truePositives;
                                    const falsePositives =
                                        getSpecimenCountForPredictedLabel(
                                            classLabel,
                                            filteredClassLabels,
                                        ) - truePositives;
                                    const trueNegatives =
                                        filteredTotalSpecimens -
                                        truePositives -
                                        falseNegatives -
                                        falsePositives;

                                    const sensitivity =
                                        truePositives + falseNegatives > 0
                                            ? truePositives /
                                              (truePositives + falseNegatives)
                                            : null;
                                    const specificity =
                                        trueNegatives + falsePositives > 0
                                            ? trueNegatives /
                                              (trueNegatives + falsePositives)
                                            : null;

                                    return (
                                        <TableRow
                                            key={classLabel}
                                            className="hover:bg-transparent"
                                        >
                                            <TableCell className="font-medium whitespace-nowrap">
                                                {classLabel}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-right">
                                                {formatMatrixPercentage(
                                                    sensitivity,
                                                )}
                                            </TableCell>
                                            <TableCell className="text-muted-foreground text-right">
                                                {formatMatrixPercentage(
                                                    specificity,
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                        <p className="text-muted-foreground text-sm leading-6">
                            {EXCLUDED_LABELS.map((label, index) => {
                                return t('specimensLabeledAs', {
                                    num: excludedSpecimenCounts[index] ?? 0,
                                    category: label,
                                });
                            })}
                        </p>
                    </div>

                    <div className="h-full space-y-3 rounded-xl border p-4">
                        <h3 className="text-sm font-semibold">
                            {t('interpretation')}
                        </h3>
                        <p className="text-muted-foreground text-sm leading-6">
                            {t('matrixCompares', {
                                category: classificationCategory,
                                location: selectedLocationName,
                            })}
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            {t('eachCellShows')}
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            {t('sensitivityExplanation')}
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            {t('specificityExplanation')}
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            {t('labelExclusionExplanation')}
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
