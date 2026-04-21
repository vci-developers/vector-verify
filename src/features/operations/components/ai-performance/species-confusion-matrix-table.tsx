import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { SpeciesConfusionMatrixData } from '@/features/operations/utils/build-species-confusion-matrix';
import { cn } from '@/utils/cn';
import {
    formatMatrixPercentage,
    getMatrixCellPresentation,
    integerCountFormatter,
} from './species-confusion-matrix-helpers';

interface SpeciesConfusionMatrixTableProps {
    speciesConfusionMatrix: SpeciesConfusionMatrixData;
}

export default function SpeciesConfusionMatrixTable({
    speciesConfusionMatrix,
}: SpeciesConfusionMatrixTableProps) {
    return (
        <div className="max-w-full">
            <Table className="min-w-[720px] table-fixed border-collapse overflow-hidden rounded-lg">
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted/40 h-12 w-60 border" />
                        <TableHead
                            className="bg-muted/40 h-12 border text-center font-semibold"
                            colSpan={
                                speciesConfusionMatrix.predictedSpeciesLabels
                                    .length
                            }
                        >
                            AI Prediction
                        </TableHead>
                    </TableRow>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="bg-muted/20 border text-center text-sm font-semibold">
                            Ground Truth
                        </TableHead>
                        {speciesConfusionMatrix.predictedSpeciesLabels.map(
                            predictedSpeciesLabel => (
                                <TableHead
                                    key={predictedSpeciesLabel}
                                    className="bg-muted/20 border px-2 text-center text-xs font-semibold"
                                >
                                    <span className="line-clamp-2 whitespace-normal">
                                        {predictedSpeciesLabel}
                                    </span>
                                </TableHead>
                            ),
                        )}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {speciesConfusionMatrix.actualSpeciesRows.map(
                        actualSpeciesRow => (
                            <TableRow
                                key={actualSpeciesRow.actualSpeciesLabel}
                                className="hover:bg-transparent"
                            >
                                <TableCell className="bg-background border text-center text-xs font-medium whitespace-normal">
                                    {actualSpeciesRow.actualSpeciesLabel}
                                </TableCell>
                                {actualSpeciesRow.predictedSpeciesCells.map(
                                    (
                                        predictedSpeciesCell,
                                        predictedSpeciesIndex,
                                    ) => {
                                        const matrixCellPresentation =
                                            getMatrixCellPresentation(
                                                predictedSpeciesCell.rowShare,
                                                predictedSpeciesCell.isCorrectPrediction,
                                            );

                                        return (
                                            <TableCell
                                                key={`${actualSpeciesRow.actualSpeciesLabel}-${speciesConfusionMatrix.predictedSpeciesLabels[predictedSpeciesIndex] ?? predictedSpeciesIndex}`}
                                                className={cn(
                                                    'border p-0',
                                                    matrixCellPresentation.className,
                                                )}
                                                style={
                                                    matrixCellPresentation.style
                                                }
                                            >
                                                <div className="flex min-h-20 flex-col items-center justify-center px-2 py-3 text-center">
                                                    <span className="text-base font-semibold">
                                                        {integerCountFormatter.format(
                                                            predictedSpeciesCell.specimenCount,
                                                        )}
                                                    </span>
                                                    <span className="text-xs opacity-90">
                                                        {formatMatrixPercentage(
                                                            predictedSpeciesCell.rowShare,
                                                        )}
                                                    </span>
                                                </div>
                                            </TableCell>
                                        );
                                    },
                                )}
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
