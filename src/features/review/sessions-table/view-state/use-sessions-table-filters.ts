'use client';

import {
    getDefaultMonthRange,
    parseAsMonth,
} from '@/lib/view-state/month-range';
import {
    parseAsArrayOf,
    parseAsInteger,
    parseAsString,
    useQueryStates,
} from 'nuqs';

const monthDefaults = getDefaultMonthRange(new Date());

const sessionsTableSearchParams = {
    startMonth: parseAsMonth.withDefault(monthDefaults.startMonth),
    endMonth: parseAsMonth.withDefault(monthDefaults.endMonth),
    selectedLocation: parseAsString.withDefault(''),
    selectedCycleIds: parseAsArrayOf(parseAsInteger).withDefault([]),
    search: parseAsString.withDefault(''),
};

const sessionsTableUrlKeys = {
    startMonth: 'sessionsStartMonth',
    endMonth: 'sessionsEndMonth',
    selectedLocation: 'sessionsLocation',
    selectedCycleIds: 'sessionsCycles',
    search: 'sessionsSearch',
} as const;

export function useSessionsTableFilters() {
    const [filters, setFilters] = useQueryStates(sessionsTableSearchParams, {
        urlKeys: sessionsTableUrlKeys,
    });

    const resolvedFilters =
        filters.startMonth > filters.endMonth
            ? { ...filters, ...monthDefaults }
            : filters;

    return [resolvedFilters, setFilters] as const;
}
