'use client';

import { createContext, useContext } from 'react';

export const ReviewSiteListMonthKeyContext = createContext<string | null>(null);

export function useReviewSiteListMonthKey() {
    const monthKey = useContext(ReviewSiteListMonthKeyContext);
    if (monthKey === null) {
        throw new Error(
            'useReviewSiteListMonthKey must be used within a ReviewSitesList month.',
        );
    }
    return monthKey;
}
