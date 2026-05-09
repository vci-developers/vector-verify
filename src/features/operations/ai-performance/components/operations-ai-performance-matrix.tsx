'use client';

import { Fragment } from 'react';
import type { GetAnnotationsSummarySuccessPayload } from '@/api/annotation/validation/get-annotations-summary-schema';
import SpeciesConfusionMatrixAccuracyCard from '@/features/operations/ai-performance/components/species-confusion-matrix-accuracy-card';
import SpeciesConfusionMatrixCard from '@/features/operations/ai-performance/components/species-confusion-matrix-card';
import SpeciesConfusionMatrixStateCard from '@/features/operations/ai-performance/components/species-confusion-matrix-state-card';
import { buildSpeciesConfusionMatrix } from '@/features/operations/ai-performance/utils/build-species-confusion-matrix';

interface OperationsAiPerformanceMatrixProps {
    annotationsSummary: GetAnnotationsSummarySuccessPayload;
    selectedLocationName: string;
}

export default function OperationsAiPerformanceMatrix({
    annotationsSummary,
    selectedLocationName,
}: OperationsAiPerformanceMatrixProps) {
    const speciesConfusionMatrix =
        buildSpeciesConfusionMatrix(annotationsSummary);

    return (
        <Fragment>
            <SpeciesConfusionMatrixAccuracyCard
                speciesConfusionMatrix={speciesConfusionMatrix}
            />
            {speciesConfusionMatrix ? (
                <SpeciesConfusionMatrixCard
                    speciesConfusionMatrix={speciesConfusionMatrix}
                    selectedLocationName={selectedLocationName}
                />
            ) : (
                <SpeciesConfusionMatrixStateCard
                    message={`No species confusion matrix is available for ${selectedLocationName} within the selected date range.`}
                />
            )}
        </Fragment>
    );
}
