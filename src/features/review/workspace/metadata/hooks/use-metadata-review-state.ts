'use client';

import { useState } from 'react';

export function useMetadataReviewState() {
    const [resolutionsByMetadataRowId, setResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());

    function handleConflictResolutionChange(
        metadataRowId: string,
        chosenDisplayValue: string,
    ) {
        setResolutionsByMetadataRowId(previous =>
            new Map(previous).set(metadataRowId, chosenDisplayValue),
        );
    }

    function resetResolutions() {
        setResolutionsByMetadataRowId(new Map());
    }

    return {
        resolutionsByMetadataRowId,
        handleConflictResolutionChange,
        resetResolutions,
    };
}
