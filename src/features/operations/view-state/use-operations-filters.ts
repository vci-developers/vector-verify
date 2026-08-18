'use client';

import {
    getDefaultMonthRange,
    parseAsMonth,
} from '@/lib/view-state/month-range';
import {
    parseAsArrayOf,
    parseAsString,
    parseAsStringLiteral,
    useQueryStates,
    type inferParserType,
} from 'nuqs';

const monthDefaults = getDefaultMonthRange(new Date());

const operationsSearchParams = {
    activeTab: parseAsStringLiteral([
        'geographical-summary',
        'specimen-composition',
        'ai-performance',
        'intervention-metrics',
        'field-user-compliance',
    ]).withDefault('geographical-summary'),
    startMonth: parseAsMonth.withDefault(monthDefaults.startMonth),
    endMonth: parseAsMonth.withDefault(monthDefaults.endMonth),
    selectedLocations: parseAsArrayOf(parseAsString).withDefault([]),
    selectedSpecies: parseAsArrayOf(parseAsString),
};

export type OperationsTab = inferParserType<
    typeof operationsSearchParams.activeTab
>;

const operationsUrlKeys = {
    activeTab: 'tab',
    selectedLocations: 'location',
    selectedSpecies: 'species',
} as const;

export function useOperationsFilters() {
    const [filters, setFilters] = useQueryStates(operationsSearchParams, {
        urlKeys: operationsUrlKeys,
    });

    const resolvedFilters =
        filters.startMonth > filters.endMonth
            ? { ...filters, ...monthDefaults }
            : filters;

    return [resolvedFilters, setFilters] as const;
}
