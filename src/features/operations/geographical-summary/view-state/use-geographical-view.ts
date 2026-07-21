'use client';

import { GEOGRAPHICAL_VIEWS } from '@/features/operations/geographical-summary/utils/geographical-summary-helpers';
import { parseAsStringLiteral, useQueryState } from 'nuqs';

export function useGeographicalView() {
    return useQueryState(
        'view',
        parseAsStringLiteral(GEOGRAPHICAL_VIEWS).withDefault('specimens'),
    );
}
