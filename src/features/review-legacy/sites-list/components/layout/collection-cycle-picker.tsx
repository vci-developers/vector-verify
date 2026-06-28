'use client';

import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import { useTranslations } from 'next-intl';
import { formatCollectionCycleLabel } from '@/features/review-legacy/sites-list/utils/format-collection-cycle-label';

interface CollectionCyclePickerProps {
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onChange: (ids: number[]) => void;
    disabled?: boolean;
}

export default function CollectionCyclePicker({
    collectionCycles,
    selectedCycleIds,
    onChange,
    disabled,
}: CollectionCyclePickerProps) {
    const t = useTranslations('CollectionCycle');

    const selectedCycleIdStrings = selectedCycleIds.map(String);

    function handleCollectionCycleIdsChange(stringIds: string[]) {
        onChange(stringIds.map(Number));
    }

    return (
        <MultiSelect
            values={selectedCycleIdStrings}
            onValuesChange={handleCollectionCycleIdsChange}
        >
            <MultiSelectTrigger className="w-52" disabled={disabled}>
                <MultiSelectValue
                    placeholder={t('allCycles')}
                    overflowBehavior="cutoff"
                />
            </MultiSelectTrigger>
            <MultiSelectContent search={false}>
                <MultiSelectGroup>
                    {collectionCycles.map(cycle => (
                        <MultiSelectItem
                            key={cycle.id}
                            value={String(cycle.id)}
                            badgeLabel={t('badgeLabel', {
                                cycleNumber: cycle.cycleNumber,
                            })}
                            className="pr-6"
                        >
                            {formatCollectionCycleLabel(cycle, t)}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
