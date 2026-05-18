import { useMemo, useState } from 'react';

const FIELD_DEPENDENCIES: Record<
    string,
    { dependentIds: string[]; disablingValues: string[] }
> = {
    'surveillanceForm.wasIrsConducted': {
        dependentIds: ['surveillanceForm.monthsSinceIrs'],
        disablingValues: ['No', 'N/A'],
    },
    'surveillanceForm.numLlinsAvailable': {
        dependentIds: [
            'surveillanceForm.llinType',
            'surveillanceForm.llinBrand',
            'surveillanceForm.numPeopleSleptUnderLlin',
        ],
        disablingValues: ['0', 'N/A'],
    },
};

export default function useMetadataReviewState() {
    const [resolutionsByMetadataRowId, setResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());
    const [
        savedResolutionsByMetadataRowId,
        setSavedResolutionsByMetadataRowId,
    ] = useState<Map<string, string>>(new Map());

    const disabledRowIds = useMemo(() => {
        const nextDisabledRowIds = new Set<string>();
        for (const [
            parentId,
            { dependentIds, disablingValues },
        ] of Object.entries(FIELD_DEPENDENCIES)) {
            if (
                disablingValues.includes(
                    resolutionsByMetadataRowId.get(parentId) ?? '',
                )
            ) {
                for (const id of dependentIds) nextDisabledRowIds.add(id);
            }
        }
        return nextDisabledRowIds;
    }, [resolutionsByMetadataRowId]);

    function handleConflictResolutionChange(
        metadataRowId: string,
        displayValue: string,
    ) {
        const fieldDependency = FIELD_DEPENDENCIES[metadataRowId];

        const nextResolutions = new Map(resolutionsByMetadataRowId);
        nextResolutions.set(metadataRowId, displayValue);
        const nextSaved = new Map(savedResolutionsByMetadataRowId);

        if (fieldDependency) {
            if (fieldDependency.disablingValues.includes(displayValue)) {
                for (const id of fieldDependency.dependentIds) {
                    if (nextResolutions.has(id) && !nextSaved.has(id)) {
                        nextSaved.set(id, nextResolutions.get(id)!);
                    }
                    nextResolutions.set(id, 'N/A');
                }
            } else {
                for (const id of fieldDependency.dependentIds) {
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

    function resetResolutions() {
        setResolutionsByMetadataRowId(new Map());
        setSavedResolutionsByMetadataRowId(new Map());
    }

    return {
        resolutionsByMetadataRowId,
        disabledRowIds,
        handleConflictResolutionChange,
        resetResolutions,
    };
}
