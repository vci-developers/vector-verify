import { Bot } from 'lucide-react';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import type { SpeciesConfusionMatrixData } from '@/features/operations/utils/build-species-confusion-matrix';
import { formatMatrixPercentage } from '@/features/operations/utils/species-confusion-matrix-helpers';

interface SpeciesConfusionMatrixMetricsProps {
    speciesConfusionMatrix: SpeciesConfusionMatrixData;
}

export default function SpeciesConfusionMatrixMetrics({
    speciesConfusionMatrix,
}: SpeciesConfusionMatrixMetricsProps) {
    return (
        <div className="h-full space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Per-Class Metrics</h3>
            </div>
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-full">Species</TableHead>
                        <TableHead className="text-right">
                            Sensitivity
                        </TableHead>
                        <TableHead className="text-right">
                            Specificity
                        </TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {speciesConfusionMatrix.speciesClassificationMetrics.map(
                        speciesMetric => (
                            <TableRow
                                key={speciesMetric.speciesLabel}
                                className="hover:bg-transparent"
                            >
                                <TableCell className="font-medium whitespace-nowrap">
                                    {speciesMetric.speciesLabel}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-right">
                                    {formatMatrixPercentage(
                                        speciesMetric.sensitivity,
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-right">
                                    {formatMatrixPercentage(
                                        speciesMetric.specificity,
                                    )}
                                </TableCell>
                            </TableRow>
                        ),
                    )}
                </TableBody>
            </Table>
        </div>
    );
}
