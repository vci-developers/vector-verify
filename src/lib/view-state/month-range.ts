import { format, startOfMonth, subMonths } from 'date-fns';
import { createParser } from 'nuqs';

const MONTH_PARAM_PATTERN = /^(19|20)\d{2}-(0[1-9]|1[0-2])$/;

export const parseAsMonth = createParser<Date>({
    parse(value) {
        if (!MONTH_PARAM_PATTERN.test(value)) return null;
        const [yearPart, monthPart] = value.split('-');
        return new Date(Number(yearPart), Number(monthPart) - 1, 1);
    },
    serialize(month) {
        return format(month, 'yyyy-MM');
    },
    eq(monthA, monthB) {
        return monthA.getTime() === monthB.getTime();
    },
});

export function getDefaultMonthRange(today: Date): {
    startMonth: Date;
    endMonth: Date;
} {
    return {
        startMonth: startOfMonth(subMonths(today, 2)),
        endMonth: startOfMonth(today),
    };
}
