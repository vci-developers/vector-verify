import type { FormQuestionType } from '@/api/form-question/validation/form-question-schema';
import {
    formatDateInTimezone,
    getValidTimezone,
} from '@/utils/format-date-in-timezone';
import { TZDate } from '@date-fns/tz';

const DATE_ANSWER_FORMAT = 'MMM d, yyyy';

export function formatDateAnswer(
    displayValue: string,
    fieldType: FormQuestionType,
    timezone: string | null,
): string {
    if (fieldType !== 'date' || !/^\d+$/.test(displayValue)) {
        return displayValue;
    }
    return formatDateInTimezone(
        Number(displayValue),
        timezone,
        DATE_ANSWER_FORMAT,
    );
}

export function toDateAnswerDate(
    value: string | undefined,
    timezone: string | null,
): TZDate | undefined {
    if (value === undefined || !/^\d+$/.test(value)) return undefined;
    return new TZDate(Number(value), getValidTimezone(timezone));
}
