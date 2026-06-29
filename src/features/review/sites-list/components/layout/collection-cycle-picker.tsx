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
import { formatDateInTimezone } from '@/utils/format-date-in-timezone';
import { useTranslations } from 'next-intl';

interface CollectionCyclePickerProps {
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onSelectedCycleIdsChange: (cycleIds: number[]) => void;
    disabled: boolean;
}

export default function CollectionCyclePicker({
    collectionCycles,
    selectedCycleIds,
    onSelectedCycleIdsChange,
    disabled,
}: CollectionCyclePickerProps) {
    const t = useTranslations('CollectionCycle');

    return (
        <MultiSelect
            values={selectedCycleIds.map(String)}
            onValuesChange={values =>
                onSelectedCycleIdsChange(values.map(Number))
            }
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
                            {t('cycleLabel', {
                                cycleNumber: cycle.cycleNumber,
                                start: formatDateInTimezone(
                                    cycle.startDate,
                                    cycle.timezone,
                                    'MMM d',
                                ),
                                end: formatDateInTimezone(
                                    cycle.endDate,
                                    cycle.timezone,
                                    'MMM d, yyyy',
                                ),
                            })}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
