import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import type { ControllerFieldState } from 'react-hook-form';

interface PredictionSelectFieldProps<Option extends string> {
    id: string;
    label: string;
    options: readonly Option[];
    value: Option | undefined;
    onValueChange: (value: Option) => void;
    isApplicable: boolean;
    error: ControllerFieldState['error'];
}

export default function PredictionSelectField<Option extends string>({
    id,
    label,
    options,
    value,
    onValueChange,
    isApplicable,
    error,
}: PredictionSelectFieldProps<Option>) {
    const t = useTranslations('ReviewImage');

    return (
        <Field data-invalid={error !== undefined}>
            <FieldLabel htmlFor={id}>
                {label}
                {isApplicable && (
                    <span className="text-destructive">{t('required')}</span>
                )}
            </FieldLabel>
            <Select
                disabled={!isApplicable}
                onValueChange={selectedValue =>
                    onValueChange(selectedValue as Option)
                }
                value={value ?? ''}
            >
                <SelectTrigger id={id}>
                    <SelectValue
                        placeholder={
                            isApplicable
                                ? t('selectPlaceholder')
                                : t('notApplicable')
                        }
                    />
                </SelectTrigger>
                <SelectContent>
                    {options.map(option => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {error && <FieldError errors={[error]} />}
        </Field>
    );
}
