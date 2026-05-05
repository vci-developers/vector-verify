import type {
    AnnotationConfusionMatrix,
    GetAnnotationsSummarySuccessPayload,
} from '@/api/annotation/validation/get-annotations-summary-schema';

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

function getOrderedSpeciesLabels(
    speciesConfusionMatrix: AnnotationConfusionMatrix,
): string[] {
    return Array.from(
        new Set([
            ...speciesConfusionMatrix.columns,
            ...speciesConfusionMatrix.data.map(({ rowLabel }) => rowLabel),
        ]),
    );
}

function getValidatedSpecimenCount(
    rawSpecimenCount: number | undefined,
): number {
    if (
        rawSpecimenCount === undefined ||
        !Number.isFinite(rawSpecimenCount) ||
        rawSpecimenCount < 0
    ) {
        return 0;
    }

    return rawSpecimenCount;
}

function buildSpecimenCountsByActualAndPredictedSpecies(
    speciesConfusionMatrix: AnnotationConfusionMatrix,
    orderedSpeciesLabels: string[],
) {
    const confusionMatrixValuesByActualSpecies = new Map(
        speciesConfusionMatrix.data.map(({ rowLabel, values }) => [
            rowLabel,
            values,
        ]),
    );

    return orderedSpeciesLabels.map(actualSpeciesLabel => {
        const specimenCountsByPredictedSpecies =
            confusionMatrixValuesByActualSpecies.get(actualSpeciesLabel);

        return orderedSpeciesLabels.map(predictedSpeciesLabel =>
            getValidatedSpecimenCount(
                specimenCountsByPredictedSpecies?.[predictedSpeciesLabel],
            ),
        );
    });
}

function buildSpecimenTotalsByActualSpecies(
    specimenCountsByActualAndPredictedSpecies: number[][],
) {
    return specimenCountsByActualAndPredictedSpecies.map(
        predictedSpeciesCountsForActualSpecies =>
            predictedSpeciesCountsForActualSpecies.reduce(
                (sum, specimenCount) => sum + specimenCount,
                0,
            ),
    );
}

function buildSpecimenTotalsByPredictedSpecies(
    specimenCountsByActualAndPredictedSpecies: number[][],
    orderedSpeciesLabels: string[],
) {
    return orderedSpeciesLabels.map((_, predictedSpeciesIndex) =>
        specimenCountsByActualAndPredictedSpecies.reduce(
            (sum, predictedSpeciesCountsForActualSpecies) =>
                sum +
                (predictedSpeciesCountsForActualSpecies[
                    predictedSpeciesIndex
                ] ?? 0),
            0,
        ),
    );
}

function buildActualSpeciesRows(
    orderedSpeciesLabels: string[],
    specimenCountsByActualAndPredictedSpecies: number[][],
    specimenTotalsByActualSpecies: number[],
): SpeciesConfusionMatrixRow[] {
    return orderedSpeciesLabels.map(
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
}

function buildSpeciesClassificationMetrics(
    orderedSpeciesLabels: string[],
    specimenCountsByActualAndPredictedSpecies: number[][],
    specimenTotalsByActualSpecies: number[],
    specimenTotalsByPredictedSpecies: number[],
    totalSpecimenComparisons: number,
): SpeciesClassificationMetric[] {
    return orderedSpeciesLabels.map((speciesLabel, speciesIndex) => {
        const truePositiveCount =
            specimenCountsByActualAndPredictedSpecies[speciesIndex]?.[
                speciesIndex
            ] ?? 0;
        const actualSpeciesTotal =
            specimenTotalsByActualSpecies[speciesIndex] ?? 0;
        const predictedSpeciesTotal =
            specimenTotalsByPredictedSpecies[speciesIndex] ?? 0;
        const falseNegativeCount = actualSpeciesTotal - truePositiveCount;
        const falsePositiveCount = predictedSpeciesTotal - truePositiveCount;
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
    });
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

    const specimenCountsByActualAndPredictedSpecies =
        buildSpecimenCountsByActualAndPredictedSpecies(
            speciesConfusionMatrix,
            orderedSpeciesLabels,
        );

    const specimenTotalsByActualSpecies = buildSpecimenTotalsByActualSpecies(
        specimenCountsByActualAndPredictedSpecies,
    );

    const specimenTotalsByPredictedSpecies =
        buildSpecimenTotalsByPredictedSpecies(
            specimenCountsByActualAndPredictedSpecies,
            orderedSpeciesLabels,
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

    const actualSpeciesRows = buildActualSpeciesRows(
        orderedSpeciesLabels,
        specimenCountsByActualAndPredictedSpecies,
        specimenTotalsByActualSpecies,
    );

    const speciesClassificationMetrics = buildSpeciesClassificationMetrics(
        orderedSpeciesLabels,
        specimenCountsByActualAndPredictedSpecies,
        specimenTotalsByActualSpecies,
        specimenTotalsByPredictedSpecies,
        totalSpecimenComparisons,
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
