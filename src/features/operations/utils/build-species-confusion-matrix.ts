import type { GetAnnotationsSummarySuccessPayload } from '@/api/annotation/validation/get-annotations-summary-schema';

interface SpeciesConfusionMatrixCell {
    specimenCount: number;
    rowShare: number | null;
    isCorrectPrediction: boolean;
}

interface SpeciesConfusionMatrixRow {
    actualSpeciesLabel: string;
    predictedSpeciesCells: SpeciesConfusionMatrixCell[];
}

interface SpeciesClassificationMetric {
    speciesLabel: string;
    sensitivity: number | null;
    specificity: number | null;
}

export interface SpeciesConfusionMatrixData {
    predictedSpeciesLabels: string[];
    actualSpeciesRows: SpeciesConfusionMatrixRow[];
    speciesClassificationMetrics: SpeciesClassificationMetric[];
    totalSpecimenComparisons: number;
    correctPredictionCount: number;
    accuracy: number | null;
}

type SpeciesConfusionMatrixPayload = NonNullable<
    NonNullable<
        GetAnnotationsSummarySuccessPayload['confusionMatrices']
    >['species']
>;

const PRIMARY_VECTOR_PATTERNS = [
    /^anopheles\s+gambiae$/i,
    /^anopheles\s+funestus$/i,
];

function getSpeciesPriorityGroup(speciesLabel: string): number {
    const normalizedSpeciesLabel = speciesLabel.trim().toLowerCase();

    if (
        PRIMARY_VECTOR_PATTERNS.some(primaryVectorPattern =>
            primaryVectorPattern.test(normalizedSpeciesLabel),
        )
    ) {
        return 0;
    }

    if (normalizedSpeciesLabel.startsWith('anopheles')) {
        return 1;
    }

    if (
        normalizedSpeciesLabel.includes('aedes') ||
        normalizedSpeciesLabel.includes('culex') ||
        normalizedSpeciesLabel.includes('mansonia') ||
        normalizedSpeciesLabel.includes('culicine')
    ) {
        return 2;
    }

    if (
        normalizedSpeciesLabel.includes('non mosquito') ||
        normalizedSpeciesLabel.includes('non-mosquito')
    ) {
        return 3;
    }

    if (normalizedSpeciesLabel === 'unknown') {
        return 5;
    }

    return 4;
}

function getOrderedSpeciesLabels(
    speciesConfusionMatrix: SpeciesConfusionMatrixPayload,
): string[] {
    const speciesLabelsInEncounterOrder = Array.from(
        new Set([
            ...speciesConfusionMatrix.columns,
            ...speciesConfusionMatrix.data.map(row => row.rowLabel),
        ]),
    );

    const speciesLabelOrderByEncounter = new Map(
        speciesLabelsInEncounterOrder.map((speciesLabel, encounterIndex) => [
            speciesLabel,
            encounterIndex,
        ]),
    );

    return [...speciesLabelsInEncounterOrder].sort(
        (leftSpeciesLabel, rightSpeciesLabel) => {
            const priorityDifference =
                getSpeciesPriorityGroup(leftSpeciesLabel) -
                getSpeciesPriorityGroup(rightSpeciesLabel);

            if (priorityDifference !== 0) {
                return priorityDifference;
            }

            return (
                (speciesLabelOrderByEncounter.get(leftSpeciesLabel) ?? 0) -
                (speciesLabelOrderByEncounter.get(rightSpeciesLabel) ?? 0)
            );
        },
    );
}

function getValidatedSpecimenCount(rawSpecimenCount: unknown): number {
    return typeof rawSpecimenCount === 'number' && rawSpecimenCount >= 0
        ? rawSpecimenCount
        : 0;
}

export function buildSpeciesConfusionMatrix(
    annotationsSummary: GetAnnotationsSummarySuccessPayload,
): SpeciesConfusionMatrixData | null {
    const speciesConfusionMatrix =
        annotationsSummary.confusionMatrices?.species;

    if (!speciesConfusionMatrix) {
        return null;
    }

    const orderedSpeciesLabels = getOrderedSpeciesLabels(
        speciesConfusionMatrix,
    );

    if (orderedSpeciesLabels.length === 0) {
        return null;
    }

    const confusionMatrixRowsByActualSpecies = new Map(
        speciesConfusionMatrix.data.map(speciesRow => [
            speciesRow.rowLabel,
            speciesRow,
        ]),
    );

    const specimenCountsByActualAndPredictedSpecies = orderedSpeciesLabels.map(
        actualSpeciesLabel => {
            const confusionMatrixRowForActualSpecies =
                confusionMatrixRowsByActualSpecies.get(actualSpeciesLabel);

            return orderedSpeciesLabels.map(predictedSpeciesLabel =>
                getValidatedSpecimenCount(
                    confusionMatrixRowForActualSpecies?.values[
                        predictedSpeciesLabel
                    ],
                ),
            );
        },
    );

    const specimenTotalsByActualSpecies =
        specimenCountsByActualAndPredictedSpecies.map(
            predictedSpeciesCountsForActualSpecies =>
                predictedSpeciesCountsForActualSpecies.reduce(
                    (sum, specimenCount) => sum + specimenCount,
                    0,
                ),
        );

    const specimenTotalsByPredictedSpecies = orderedSpeciesLabels.map(
        (_, predictedSpeciesIndex) =>
            specimenCountsByActualAndPredictedSpecies.reduce(
                (sum, predictedSpeciesCountsForActualSpecies) =>
                    sum +
                    (predictedSpeciesCountsForActualSpecies[
                        predictedSpeciesIndex
                    ] ?? 0),
                0,
            ),
    );

    const totalSpecimenComparisons = specimenTotalsByActualSpecies.reduce(
        (sum, specimenCount) => sum + specimenCount,
        0,
    );

    const correctPredictionCount =
        specimenCountsByActualAndPredictedSpecies.reduce(
            (sum, predictedSpeciesCountsForActualSpecies, speciesIndex) =>
                sum +
                (predictedSpeciesCountsForActualSpecies[speciesIndex] ?? 0),
            0,
        );

    const actualSpeciesRows = orderedSpeciesLabels.map(
        (actualSpeciesLabel, actualSpeciesIndex) => {
            const actualSpeciesTotal =
                specimenTotalsByActualSpecies[actualSpeciesIndex] ?? 0;

            return {
                actualSpeciesLabel,
                predictedSpeciesCells: orderedSpeciesLabels.map(
                    (predictedSpeciesLabel, predictedSpeciesIndex) => {
                        const specimenCount =
                            specimenCountsByActualAndPredictedSpecies[
                                actualSpeciesIndex
                            ]?.[predictedSpeciesIndex] ?? 0;

                        return {
                            specimenCount,
                            rowShare:
                                actualSpeciesTotal > 0
                                    ? specimenCount / actualSpeciesTotal
                                    : null,
                            isCorrectPrediction:
                                actualSpeciesLabel === predictedSpeciesLabel,
                        };
                    },
                ),
            };
        },
    );

    const speciesClassificationMetrics = orderedSpeciesLabels.map(
        (speciesLabel, speciesIndex) => {
            const truePositiveCount =
                specimenCountsByActualAndPredictedSpecies[speciesIndex]?.[
                    speciesIndex
                ] ?? 0;
            const actualSpeciesTotal =
                specimenTotalsByActualSpecies[speciesIndex] ?? 0;
            const predictedSpeciesTotal =
                specimenTotalsByPredictedSpecies[speciesIndex] ?? 0;
            const falseNegativeCount = actualSpeciesTotal - truePositiveCount;
            const falsePositiveCount =
                predictedSpeciesTotal - truePositiveCount;
            const trueNegativeCount =
                totalSpecimenComparisons -
                truePositiveCount -
                falseNegativeCount -
                falsePositiveCount;

            return {
                speciesLabel,
                sensitivity:
                    actualSpeciesTotal > 0
                        ? truePositiveCount / actualSpeciesTotal
                        : null,
                specificity:
                    trueNegativeCount + falsePositiveCount > 0
                        ? trueNegativeCount /
                          (trueNegativeCount + falsePositiveCount)
                        : null,
            };
        },
    );

    return {
        predictedSpeciesLabels: orderedSpeciesLabels,
        actualSpeciesRows,
        speciesClassificationMetrics,
        totalSpecimenComparisons,
        correctPredictionCount,
        accuracy:
            totalSpecimenComparisons > 0
                ? correctPredictionCount / totalSpecimenComparisons
                : null,
    };
}
