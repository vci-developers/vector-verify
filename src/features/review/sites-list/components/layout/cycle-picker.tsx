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

interface CyclePickerProps {
    cycles: CollectionCycle[];
    selectedCycleIds: number[];
    onChange: (ids: number[]) => void;
}

function formatCycleLabel(cycle: CollectionCycle): string {
    const start = format(new Date(cycle.startDate), 'MMM d');
    const end = format(new Date(cycle.endDate), 'MMM d, yyyy');
    return `Cycle ${cycle.cycleNumber} · ${start} – ${end}`;
}

export default function CyclePicker({
    cycles,
    selectedCycleIds,
    onChange,
}: CyclePickerProps) {
    return (
        <MultiSelect
            values={selectedCycleIds.map(String)}
            onValuesChange={values => onChange(values.map(Number))}
        >
            <MultiSelectTrigger className="w-52">
                <MultiSelectValue placeholder="All cycles" />
            </MultiSelectTrigger>
            <MultiSelectContent search={false}>
                <MultiSelectGroup>
                    {cycles.map(cycle => (
                        <MultiSelectItem
                            key={cycle.id}
                            value={String(cycle.id)}
                        >
                            {formatCycleLabel(cycle)}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
