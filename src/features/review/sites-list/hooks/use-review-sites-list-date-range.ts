'use client';

import { createContext, useContext } from 'react';

interface ReviewSiteListDateRange {
    startDate: string;
    endDate: string;
}

export const ReviewSiteListDateRangeContext =
    createContext<ReviewSiteListDateRange | null>(null);

export function useReviewSiteListDateRange() {
    const dateRange = useContext(ReviewSiteListDateRangeContext);
    if (dateRange === null) {
        throw new Error(
            'useReviewSiteListDateRange must be used within a ReviewSitesList date range.',
        );
    }
    return dateRange;
}
