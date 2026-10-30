'use client';

import type { FormQuestionType } from '@/api/form-question/validation/form-question-schema';
import { collectionMethodSchema } from '@/api/session/validation/session-schema';
import { ComboBox } from '@/components/ui/combobox';
import { Input } from '@/components/ui/input';
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
    questionOptions: string[] | null;
    isOtherTextEnabled: boolean;
    value: string | undefined;
    onValueChange: (value: string) => void;
    disabled: boolean;
}

export default function ConflictResolutionControl({
    fieldType,
    options,
    questionOptions,
    isOtherTextEnabled,
    value,
    onValueChange,
    disabled,
}: ConflictResolutionControlProps) {
    const t = useTranslations('ReviewMetadata');

    function validateWholeNonNegativeInteger(input: string): string | null {
        if (input === NOT_APPLICABLE) return null;
        return /^\d+$/.test(input) ? null : t('wholeNonNegativeIntegerError');
    }

    if (fieldType === 'boolean' || fieldType === 'select') {
        const selectOptions =
            fieldType === 'boolean'
                ? [BOOLEAN_TRUE_DISPLAY, BOOLEAN_FALSE_DISPLAY]
                : (questionOptions ?? []);
        const otherOption = collectionMethodSchema.enum.Other;
        const otherText =
            isOtherTextEnabled && value?.startsWith(otherOption)
                ? value.slice(otherOption.length).trimStart()
                : null;
        const selectValue =
            otherText !== null
                ? otherOption
                : value !== undefined && selectOptions.includes(value)
                  ? value
                  : '';
        return (
            <div className="flex flex-col gap-2">
                <Select
                    value={selectValue}
                    onValueChange={onValueChange}
                    disabled={disabled}
                >
                    <SelectTrigger className="w-72">
                        <SelectValue
                            placeholder={t('selectValuePlaceholder')}
                        />
                    </SelectTrigger>
                    <SelectContent>
                        {selectOptions.map(option => (
                            <SelectItem key={option} value={option}>
                                {option}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {otherText !== null && (
                    <Input
                        value={otherText}
                        onChange={event =>
                            onValueChange(
                                `${otherOption} ${event.target.value}`,
                            )
                        }
                        placeholder={t('otherValuePlaceholder')}
                        aria-label={t('otherValuePlaceholder')}
                        disabled={disabled}
                        className="w-72"
                    />
                )}
            </div>
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
