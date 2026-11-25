import type { Session } from '@/api/session/validation/session-schema';
import { TZDate } from '@date-fns/tz';
import { endOfMonth, format, startOfMonth } from 'date-fns';

export function buildReviewUnitHref(
    session: Session,
    { timezone, specimenId }: { timezone?: string; specimenId?: number } = {},
) {
    const queryParams = new URLSearchParams();
    if (session.collectionCycleId !== null) {
        queryParams.set('collectionCycleId', String(session.collectionCycleId));
    } else {
        const collectionMonth = new TZDate(session.collectionDate, 'UTC');
        queryParams.set(
            'startDate',
            format(startOfMonth(collectionMonth), 'yyyy-MM-dd'),
        );
        queryParams.set(
            'endDate',
            format(endOfMonth(collectionMonth), 'yyyy-MM-dd'),
        );
    }
    if (timezone) queryParams.set('timezone', timezone);
    if (specimenId !== undefined) {
        queryParams.set('step', 'images');
        queryParams.set('specimenId', String(specimenId));
    }
    return `/review/${session.siteId}?${queryParams.toString()}`;
}
