'use client';

import { useMemo, useState } from 'react';
import { NOT_APPLICABLE } from '../utils/metadata-section';

const SURVEILLANCE_FIELD_DEPENDENCIES: Record<
    string,
    { dependentRowIds: string[]; disablingDisplayValues: string[] }
> = {
    'surveillanceForm.wasIrsConducted': {
        dependentRowIds: ['surveillanceForm.monthsSinceIrs'],
        disablingDisplayValues: ['No', NOT_APPLICABLE],
    },
    'surveillanceForm.numLlinsAvailable': {
        dependentRowIds: [
            'surveillanceForm.llinType',
            'surveillanceForm.llinBrand',
            'surveillanceForm.numPeopleSleptUnderLlin',
        ],
        disablingDisplayValues: ['0', NOT_APPLICABLE],
    },
};

export function useMetadataReviewState() {
    const [resolutionsByMetadataRowId, setResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());

    const disabledRowIds = useMemo(() => {
        const nextDisabledRowIds = new Set<string>();
        for (const [parentRowId, dependency] of Object.entries(
            SURVEILLANCE_FIELD_DEPENDENCIES,
        )) {
            const parentResolution =
                resolutionsByMetadataRowId.get(parentRowId) ?? '';
            if (dependency.disablingDisplayValues.includes(parentResolution)) {
                for (const dependentRowId of dependency.dependentRowIds) {
                    nextDisabledRowIds.add(dependentRowId);
                }
            }
        }
        return nextDisabledRowIds;
    }, [resolutionsByMetadataRowId]);

    function handleConflictResolutionChange(
        metadataRowId: string,
        chosenDisplayValue: string,
    ) {
        const nextResolutions = new Map(resolutionsByMetadataRowId);
        nextResolutions.set(metadataRowId, chosenDisplayValue);

        const dependency = SURVEILLANCE_FIELD_DEPENDENCIES[metadataRowId];
        if (dependency) {
            const isDisabling =
                dependency.disablingDisplayValues.includes(chosenDisplayValue);
            for (const dependentRowId of dependency.dependentRowIds) {
                if (isDisabling) {
                    nextResolutions.set(dependentRowId, NOT_APPLICABLE);
                } else {
                    nextResolutions.delete(dependentRowId);
                }
            }
        }

        setResolutionsByMetadataRowId(nextResolutions);
    }

    function resetResolutions() {
        setResolutionsByMetadataRowId(new Map());
    }

    return {
        resolutionsByMetadataRowId,
        disabledRowIds,
        handleConflictResolutionChange,
        resetResolutions,
    };
}
