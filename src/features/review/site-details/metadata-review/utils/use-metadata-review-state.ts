'use client';

import { useState } from 'react';

const IRS_PARENT_ID = 'surveillanceForm.wasIrsConducted';
const IRS_DEPENDENT_IDS = ['surveillanceForm.monthsSinceIrs'];

const LLIN_PARENT_ID = 'surveillanceForm.numLlinsAvailable';
const LLIN_DEPENDENT_IDS = [
    'surveillanceForm.llinType',
    'surveillanceForm.llinBrand',
    'surveillanceForm.numPeopleSleptUnderLlin',
];

function deriveDisabledRowIds(
    resolutions: Map<string, string>,
): Set<string> {
    const disabled = new Set<string>();

    if (resolutions.get(IRS_PARENT_ID) === 'No') {
        for (const id of IRS_DEPENDENT_IDS) disabled.add(id);
    }

    if (resolutions.get(LLIN_PARENT_ID) === '0') {
        for (const id of LLIN_DEPENDENT_IDS) disabled.add(id);
    }

    return disabled;
}

export function useMetadataReviewState() {
    const [resolutionsByMetadataRowId, setResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());
    const [savedResolutionsByMetadataRowId, setSavedResolutionsByMetadataRowId] =
        useState<Map<string, string>>(new Map());

    const disabledRowIds = deriveDisabledRowIds(resolutionsByMetadataRowId);

    function handleConflictResolutionChange(
        metadataRowId: string,
        chosenDisplayValue: string,
    ) {
        setResolutionsByMetadataRowId(prev => {
            const next = new Map(prev);
            next.set(metadataRowId, chosenDisplayValue);

            const dependentIds =
                metadataRowId === IRS_PARENT_ID
                    ? IRS_DEPENDENT_IDS
                    : metadataRowId === LLIN_PARENT_ID
                      ? LLIN_DEPENDENT_IDS
                      : null;

            if (!dependentIds) return next;

            const isDisablingValue =
                metadataRowId === IRS_PARENT_ID
                    ? chosenDisplayValue === 'No'
                    : chosenDisplayValue === '0';

            if (isDisablingValue) {
                setSavedResolutionsByMetadataRowId(prevSaved => {
                    const nextSaved = new Map(prevSaved);
                    for (const id of dependentIds) {
                        if (next.has(id)) nextSaved.set(id, next.get(id)!);
                        next.set(id, 'N/A');
                    }
                    return nextSaved;
                });
            } else {
                setSavedResolutionsByMetadataRowId(prevSaved => {
                    const nextSaved = new Map(prevSaved);
                    for (const id of dependentIds) {
                        if (nextSaved.has(id)) {
                            next.set(id, nextSaved.get(id)!);
                            nextSaved.delete(id);
                        } else {
                            next.delete(id);
                        }
                    }
                    return nextSaved;
                });
            }

            return next;
        });
    }

    return {
        resolutionsByMetadataRowId,
        disabledRowIds,
        handleConflictResolutionChange,
    };
}
