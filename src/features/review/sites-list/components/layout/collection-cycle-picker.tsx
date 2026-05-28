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
import { format } from 'date-fns';

interface CollectionCyclePickerProps {
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onChange: (ids: number[]) => void;
}

function formatCollectionCycleLabel(cycle: CollectionCycle): string {
    const start = format(new Date(cycle.startDate), 'MMM d');
    const end = format(new Date(cycle.endDate), 'MMM d, yyyy');
    return `Cycle ${cycle.cycleNumber} · ${start} – ${end}`;
}

export default function CollectionCyclePicker({
    collectionCycles,
    selectedCycleIds,
    onChange,
}: CollectionCyclePickerProps) {
    return (
        <MultiSelect
            values={selectedCycleIds.map(String)}
            onValuesChange={values => onChange(values.map(Number))}
        >
            <MultiSelectTrigger className="w-52">
                <MultiSelectValue placeholder="All collectionCycles" />
            </MultiSelectTrigger>
            <MultiSelectContent search={false}>
                <MultiSelectGroup>
                    {collectionCycles.map(cycle => (
                        <MultiSelectItem
                            key={cycle.id}
                            value={String(cycle.id)}
                        >
                            {formatCollectionCycleLabel(cycle)}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
