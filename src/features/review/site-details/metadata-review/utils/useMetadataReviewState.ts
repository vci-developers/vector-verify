import { useState } from 'react';

const DEPENDENCY_RULES: Record<
    string,
    { dependentIds: string[]; disablingValue: string }
> = {
    'surveillanceForm.wasIrsConducted': {
        dependentIds: ['surveillanceForm.monthsSinceIrs'],
        disablingValue: 'No',
    },
    'surveillanceForm.numLlinsAvailable': {
        dependentIds: [
            'surveillanceForm.llinType',
            'surveillanceForm.llinBrand',
            'surveillanceForm.numPeopleSleptUnderLlin',
        ],
        disablingValue: '0',
    },
};

export default function useMetadataReviewState() {
    const [resolutionsByMetadataRowId, setResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());
    const [
        savedResolutionsByMetadataRowId,
        setSavedResolutionsByMetadataRowId,
    ] = useState<Map<string, string>>(new Map());

    const disabledRowIds = new Set<string>();

    for (const [parentId, { dependentIds, disablingValue }] of Object.entries(
        DEPENDENCY_RULES,
    )) {
        if (resolutionsByMetadataRowId.get(parentId) === disablingValue) {
            for (const id of dependentIds) disabledRowIds.add(id);
        }
    }

    function handleConflictResolutionChange(
        metadataRowId: string,
        displayValue: string,
    ) {
        const rule = DEPENDENCY_RULES[metadataRowId];

        const nextResolutions = new Map(resolutionsByMetadataRowId);
        nextResolutions.set(metadataRowId, displayValue);
        const nextSaved = new Map(savedResolutionsByMetadataRowId);

        if (rule) {
            if (displayValue === rule.disablingValue) {
                for (const id of rule.dependentIds) {
                    if (nextResolutions.has(id)) {
                        nextSaved.set(id, nextResolutions.get(id)!);
                    }
                    nextResolutions.set(id, 'N/A');
                }
            } else {
                for (const id of rule.dependentIds) {
                    if (nextSaved.has(id)) {
                        nextResolutions.set(id, nextSaved.get(id)!);
                        nextSaved.delete(id);
                    } else {
                        nextResolutions.delete(id);
                    }
                }
            }
        }

        setResolutionsByMetadataRowId(nextResolutions);
        setSavedResolutionsByMetadataRowId(nextSaved);
    }

    return {
        resolutionsByMetadataRowId,
        disabledRowIds,
        handleConflictResolutionChange,
    };
}
