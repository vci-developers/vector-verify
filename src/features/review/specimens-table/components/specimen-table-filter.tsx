import type { SpecimenClassificationAxis } from '@/api/specimen/validation/specimen-schema';
import {
    MultiSelect,
    MultiSelectContent,
    MultiSelectGroup,
    MultiSelectItem,
    MultiSelectTrigger,
    MultiSelectValue,
} from '@/components/ui/multi-select';
import { useTranslations } from 'next-intl';

interface SpecimenTableFilterProps {
    field: 'site' | SpecimenClassificationAxis;
    value: string;
    allLabel: string;
    options: { value: string; label: string }[];
    onValueChange: (value: string) => void;
}

export default function SpecimenTableFilter({
    field,
    value,
    allLabel,
    options,
    onValueChange,
}: SpecimenTableFilterProps) {
    const t = useTranslations('ReviewSpecimens');

    return (
        <MultiSelect
            single
            values={[value]}
            onValuesChange={values => onValueChange(values[0] ?? 'all')}
        >
            <MultiSelectTrigger aria-label={t(field)}>
                <MultiSelectValue placeholder={allLabel} />
            </MultiSelectTrigger>
            <MultiSelectContent
                search={{
                    placeholder: t(`filterSearch.${field}`),
                    emptyMessage: t('noFilterResults'),
                }}
            >
                <MultiSelectGroup>
                    <MultiSelectItem value="all">{allLabel}</MultiSelectItem>
                    {options.map(option => (
                        <MultiSelectItem
                            key={option.value}
                            value={option.value}
                        >
                            {option.label}
                        </MultiSelectItem>
                    ))}
                </MultiSelectGroup>
            </MultiSelectContent>
        </MultiSelect>
    );
}
