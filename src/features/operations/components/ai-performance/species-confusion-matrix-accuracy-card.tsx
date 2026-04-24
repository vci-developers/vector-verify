import { Card, CardContent } from '@/components/ui/card';
import type { SpeciesConfusionMatrixData } from '@/features/operations/utils/build-species-confusion-matrix';
import {
    formatMatrixPercentage,
    integerCountFormatter,
} from '@/features/operations/utils/species-confusion-matrix-helpers';

interface SpeciesConfusionMatrixAccuracyCardProps {
    speciesConfusionMatrix: SpeciesConfusionMatrixData | null;
}

export default function SpeciesConfusionMatrixAccuracyCard({
    speciesConfusionMatrix,
}: SpeciesConfusionMatrixAccuracyCardProps) {
    return (
        <Card className="border-secondary/30 bg-secondary/5 gap-0 py-0">
            <CardContent className="p-4">
                <p className="text-muted-foreground text-sm">Accuracy</p>
                <p className="mt-1 text-4xl font-semibold tracking-tight">
                    {formatMatrixPercentage(
                        speciesConfusionMatrix?.accuracy ?? null,
                    )}
                </p>
                <p className="text-muted-foreground mt-2 text-xs">
                    {speciesConfusionMatrix
                        ? `${integerCountFormatter.format(speciesConfusionMatrix.correctPredictionCount)} correct of ${integerCountFormatter.format(speciesConfusionMatrix.totalSpecimenComparisons)} species comparisons`
                        : 'From species confusion matrix'}
                </p>
            </CardContent>
        </Card>
    );
}
