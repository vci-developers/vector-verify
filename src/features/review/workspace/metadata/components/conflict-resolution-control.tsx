'use client';

import type { FormQuestionType } from '@/api/form-question/validation/form-question-schema';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { ComboBox } from '@/components/ui/combobox';
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { toDateAnswerDate } from '@/features/review/workspace/metadata/utils/format-date-answer';
import { getValidTimezone } from '@/utils/format-date-in-timezone';
import { format } from 'date-fns';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import {
    BOOLEAN_FALSE_DISPLAY,
    BOOLEAN_TRUE_DISPLAY,
    NOT_APPLICABLE,
} from '../utils/metadata-section';

interface ConflictResolutionControlProps {
    fieldType: FormQuestionType;
    options: string[];
    questionOptions: string[] | null;
    value: string | undefined;
    timezone: string | null;
    onValueChange: (value: string) => void;
    disabled: boolean;
}

export default function ConflictResolutionControl({
    fieldType,
    options,
    questionOptions,
    value,
    timezone,
    onValueChange,
    disabled,
}: ConflictResolutionControlProps) {
    const t = useTranslations('ReviewMetadata');
    const [calendarOpen, setCalendarOpen] = useState(false);

    function validateWholeNonNegativeInteger(input: string): string | null {
        if (input === NOT_APPLICABLE) return null;
        return /^\d+$/.test(input) ? null : t('wholeNonNegativeIntegerError');
    }

    if (fieldType === 'date') {
        const selectedDate = toDateAnswerDate(value, timezone);
        return (
            <Popover modal open={calendarOpen} onOpenChange={setCalendarOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        className="w-72 justify-between font-normal"
                        disabled={disabled}
                    >
                        {selectedDate
                            ? format(selectedDate, 'MMM d, yyyy')
                            : t('selectValuePlaceholder')}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                    <Calendar
                        mode="single"
                        timeZone={getValidTimezone(timezone)}
                        selected={selectedDate}
                        defaultMonth={selectedDate}
                        onSelect={date => {
                            if (!date) return;
                            onValueChange(String(date.getTime()));
                            setCalendarOpen(false);
                        }}
                        disabled={{ after: new Date() }}
                        autoFocus
                    />
                </PopoverContent>
            </Popover>
        );
    }

    if (fieldType === 'boolean' || fieldType === 'select') {
        const selectOptions =
            fieldType === 'boolean'
                ? [BOOLEAN_TRUE_DISPLAY, BOOLEAN_FALSE_DISPLAY]
                : (questionOptions ?? []);
        const selectValue =
            value === NOT_APPLICABLE || value === undefined ? '' : value;
        return (
            <Select
                value={selectValue}
                onValueChange={onValueChange}
                disabled={disabled}
            >
                <SelectTrigger className="w-72">
                    <SelectValue placeholder={t('selectValuePlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                    {selectOptions.map(option => (
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
