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
import { formatCollectionCycleLabel } from '@/features/review/sites-list/utils/format-collection-cycle-label';

interface CollectionCyclePickerProps {
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onChange: (ids: number[]) => void;
}

export default function CollectionCyclePicker({
    collectionCycles,
    selectedCycleIds,
    onChange,
}: CollectionCyclePickerProps) {
    const t = useTranslations('CollectionCycle');

    return (
        <MultiSelect
            values={selectedCycleIds.map(String)}
            onValuesChange={values => onChange(values.map(Number))}
        >
            <MultiSelectTrigger className="w-52">
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
                            badgeLabel={`Cycle ${cycle.cycleNumber}`}
                            className="pr-6"
                        >
                            {formatCollectionCycleLabel(cycle)}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
