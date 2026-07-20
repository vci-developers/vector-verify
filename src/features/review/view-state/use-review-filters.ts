'use client';

import {
    getDefaultMonthRange,
    parseAsMonth,
} from '@/lib/view-state/month-range';
import { REVIEW_STATE_SEVERITY_ORDER } from '@/features/review/utils/review-site-session-summary';
import {
    parseAsArrayOf,
    parseAsInteger,
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
    selectedCycleIds: parseAsArrayOf(parseAsInteger).withDefault([]),
    selectedReviewStates: parseAsArrayOf(
        parseAsStringLiteral(REVIEW_STATE_SEVERITY_ORDER),
    ).withDefault(['NEEDS_REVIEW']),
};

export type ReviewTab = inferParserType<typeof reviewSearchParams.activeTab>;

const reviewUrlKeys = {
    activeTab: 'tab',
    selectedLocation: 'location',
    selectedCycleIds: 'cycles',
    selectedReviewStates: 'states',
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
