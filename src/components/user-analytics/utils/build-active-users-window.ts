import { format, subDays } from 'date-fns';

export type ActiveUsersWindow = '1d' | '7d' | '30d';

export const DEFAULT_ACTIVE_USERS_WINDOW: ActiveUsersWindow = '7d';

export const ACTIVE_USERS_WINDOW_LABEL_KEYS: Record<ActiveUsersWindow, string> =
    {
        '1d': 'window1d',
        '7d': 'window7d',
        '30d': 'window30d',
    };

const WINDOW_DAYS: Record<ActiveUsersWindow, number> = {
    '1d': 1,
    '7d': 7,
    '30d': 30,
};

export function buildActiveUsersWindow(
    window: ActiveUsersWindow,
    endDate: Date = new Date(),
) {
    const startDateCutoff = subDays(endDate, WINDOW_DAYS[window]);

    return {
        startDate: format(startDateCutoff, 'yyyy-MM-dd'),
        endDate: format(endDate, 'yyyy-MM-dd'),
        startDateCutoff,
    };
}
