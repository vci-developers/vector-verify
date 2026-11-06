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
import { formatCollectionCycleLabel } from '@/features/review/utils/format-collection-cycle-label';
import { useTranslations } from 'next-intl';

interface CollectionCyclePickerProps {
    collectionCycles: CollectionCycle[];
    selectedCycleIds: number[];
    onSelectedCycleIdsChange: (cycleIds: number[]) => void;
    disabled: boolean;
    single?: boolean;
}

export default function CollectionCyclePicker({
    collectionCycles,
    selectedCycleIds,
    onSelectedCycleIdsChange,
    disabled,
    single = false,
}: CollectionCyclePickerProps) {
    const t = useTranslations('CollectionCycle');

    return (
        <MultiSelect
            single={single}
            values={(single
                ? selectedCycleIds.slice(0, 1)
                : selectedCycleIds
            ).map(String)}
            onValuesChange={values =>
                onSelectedCycleIdsChange(values.map(Number))
            }
        >
            <MultiSelectTrigger
                aria-label={t('filterByCycle')}
                className="w-52"
                disabled={disabled}
            >
                <MultiSelectValue
                    placeholder={t('allCycles')}
                    overflowBehavior="cutoff"
                />
            </MultiSelectTrigger>
            <MultiSelectContent
                search={
                    single
                        ? {
                              placeholder: t('searchCycles'),
                              emptyMessage: t('noCyclesFound'),
                          }
                        : false
                }
            >
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
                            {formatCollectionCycleLabel(cycle)}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
