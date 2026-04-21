import { Bot } from 'lucide-react';
import type { SpeciesConfusionMatrixData } from '@/features/operations/utils/build-species-confusion-matrix';
import { formatMatrixPercentage } from './species-confusion-matrix-helpers';

interface SpeciesConfusionMatrixMetricsProps {
    speciesConfusionMatrix: SpeciesConfusionMatrixData;
}

export default function SpeciesConfusionMatrixMetrics({
    speciesConfusionMatrix,
}: SpeciesConfusionMatrixMetricsProps) {
    return (
        <div className="space-y-3 rounded-xl border p-4">
            <div className="flex items-center gap-2">
                <Bot className="h-4 w-4" />
                <h3 className="text-sm font-semibold">Per-Class Metrics</h3>
            </div>
            <div className="space-y-3">
                {speciesConfusionMatrix.speciesClassificationMetrics.map(
                    speciesMetric => (
                        <div
                            key={speciesMetric.speciesLabel}
                            className="grid grid-cols-[minmax(0,1fr)_108px_108px] items-center gap-3 text-sm"
                        >
                            <span className="font-medium">
                                {speciesMetric.speciesLabel}
                            </span>
                            <span className="text-muted-foreground text-right">
                                Sens:{' '}
                                {formatMatrixPercentage(
                                    speciesMetric.sensitivity,
                                )}
                            </span>
                            <span className="text-muted-foreground text-right">
                                Spec:{' '}
                                {formatMatrixPercentage(
                                    speciesMetric.specificity,
                                )}
                            </span>
                        </div>
                    ),
                )}
            </div>
        </div>
    );
}
