'use client';

import type { FormQuestionType } from '@/api/form-question/validation/form-question-schema';
import { ComboBox } from '@/components/ui/combobox';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useTranslations } from 'next-intl';
import {
    BOOLEAN_FALSE_DISPLAY,
    BOOLEAN_TRUE_DISPLAY,
    NOT_APPLICABLE,
} from '../utils/metadata-section';

interface ConflictResolutionControlProps {
    fieldType: FormQuestionType;
    options: string[];
    value: string | undefined;
    onValueChange: (value: string) => void;
    disabled: boolean;
}

export default function ConflictResolutionControl({
    fieldType,
    options,
    value,
    onValueChange,
    disabled,
}: ConflictResolutionControlProps) {
    const t = useTranslations('ReviewMetadata');

    function validateWholeNonNegativeInteger(input: string): string | null {
        if (input === NOT_APPLICABLE) return null;
        return /^\d+$/.test(input) ? null : t('wholeNonNegativeIntegerError');
    }

    if (fieldType === 'boolean') {
        const booleanOptions = [
            ...new Set([
                BOOLEAN_TRUE_DISPLAY,
                BOOLEAN_FALSE_DISPLAY,
                ...options,
            ]),
        ];
        return (
            <Select
                value={value}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-72">
                    <SelectValue placeholder={t('selectValuePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    {booleanOptions.map(option => (
                        <SelectItem key={option} value={option}>
                            {option}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        );
    }

    return (
        <ComboBox
            options={options}
            value={value}
            onValueChange={onValueChange}
            placeholder={t('selectValuePlaceholder')}
            validate={
                fieldType === 'number'
                    ? validateWholeNonNegativeInteger
                    : undefined
            }
            disabled={disabled}
            className="w-72"
        />
    );
}
