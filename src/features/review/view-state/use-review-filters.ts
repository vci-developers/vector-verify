'use client';

import {
    getDefaultMonthRange,
    parseAsMonth,
} from '@/lib/view-state/month-param';
import {
    parseAsString,
    parseAsStringLiteral,
    useQueryStates,
    type inferParserType,
} from 'nuqs';

const monthDefaults = getDefaultMonthRange(new Date());

const reviewSearchParams = {
    activeTab: parseAsStringLiteral(['sites-list', 'submissions']).withDefault(
        'sites-list',
    ),
    startMonth: parseAsMonth.withDefault(monthDefaults.startMonth),
    endMonth: parseAsMonth.withDefault(monthDefaults.endMonth),
    selectedLocation: parseAsString.withDefault(''),
};

export type ReviewTab = inferParserType<typeof reviewSearchParams.activeTab>;

const reviewUrlKeys = {
    activeTab: 'tab',
    selectedLocation: 'location',
} as const;

export function useReviewFilters() {
    const [filters, setFilters] = useQueryStates(reviewSearchParams, {
        urlKeys: reviewUrlKeys,
    });

    const resolvedFilters =
        filters.startMonth > filters.endMonth
            ? { ...filters, ...monthDefaults }
            : filters;

    return [resolvedFilters, setFilters] as const;
}
