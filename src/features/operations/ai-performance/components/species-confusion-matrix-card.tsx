import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { SpeciesConfusionMatrixData } from '@/features/operations/ai-performance/utils/build-species-confusion-matrix';
import SpeciesConfusionMatrixMetrics from './species-confusion-matrix-metrics';
import SpeciesConfusionMatrixTable from './species-confusion-matrix-table';

interface SpeciesConfusionMatrixCardProps {
    speciesConfusionMatrix: SpeciesConfusionMatrixData;
    selectedLocationName: string;
}

export default function SpeciesConfusionMatrixCard({
    speciesConfusionMatrix,
    selectedLocationName,
}: SpeciesConfusionMatrixCardProps) {
    return (
        <Card className="gap-0 lg:col-span-3">
            <CardHeader className="pb-2">
                <CardTitle className="text-xl">Confusion Matrix</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                <SpeciesConfusionMatrixTable
                    speciesConfusionMatrix={speciesConfusionMatrix}
                />

                <div className="grid items-stretch gap-4 lg:grid-cols-[500px_minmax(0,1fr)]">
                    <SpeciesConfusionMatrixMetrics
                        speciesConfusionMatrix={speciesConfusionMatrix}
                    />

                    <div className="h-full space-y-3 rounded-xl border p-4">
                        <h3 className="text-sm font-semibold">
                            Interpretation
                        </h3>
                        <p className="text-muted-foreground text-sm leading-6">
                            The matrix compares expert-reviewed specimens from
                            {` ${selectedLocationName} `}
                            against the AI species prediction for the selected
                            date range. Classes are ordered by operational
                            priority: primary Anopheles vectors, secondary
                            Anopheles vectors, culicines, then non-mosquito
                            specimens.
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            Each cell shows the specimen count and that
                            cell&apos;s share of the ground-truth row. Each
                            per-class metric is computed as a one-vs-rest
                            comparison for that species label.
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            Sensitivity = TP / (TP + FN). It measures how often
                            the AI correctly identifies specimens that truly
                            belong to that class.
                        </p>
                        <p className="text-muted-foreground text-sm leading-6">
                            Specificity = TN / (TN + FP). It measures how often
                            the AI correctly avoids assigning that class when
                            the specimen truly belongs to some other class.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
