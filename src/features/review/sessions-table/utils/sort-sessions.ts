import type { CollectionCycle } from '@/api/collection-cycle/validation/collection-cycle-schema';
import type { Session } from '@/api/session/validation/session-schema';
import type { Site } from '@/api/site/validation/site-schema';
import { getSiteDisplayName } from '@/features/review/sessions-table/utils/get-site-display-name';

export type SortColumn =
    | 'collectionCycle'
    | 'session'
    | 'site'
    | 'collectionDate'
    | 'sessionCreated'
    | 'state';
export type SortDirection = 'asc' | 'desc';

export interface SortState {
    column: SortColumn;
    direction: SortDirection;
}

function compareValues(a: string | number, b: string | number): number {
    if (typeof a === 'number' && typeof b === 'number') return a - b;
    return String(a).localeCompare(String(b));
}

function getSortValue(
    session: Session,
    column: SortColumn,
    siteById: Map<number, Site>,
    cycleById: Map<number, CollectionCycle>,
): string | number {
    switch (column) {
        case 'collectionCycle': {
            const cycle =
                session.collectionCycleId !== null
                    ? cycleById.get(session.collectionCycleId)
                    : undefined;
            return cycle?.cycleNumber ?? -1;
        }
        case 'session':
            return session.frontendId;
        case 'site':
            return getSiteDisplayName(siteById.get(session.siteId)) ?? '';
        case 'collectionDate':
            return session.collectionDate;
        case 'sessionCreated':
            return session.createdAt;
        case 'state':
            return session.state ?? '';
    }
}

export function sortSessions(
    sessions: Session[],
    sort: SortState | null,
    siteById: Map<number, Site>,
    cycleById: Map<number, CollectionCycle>,
): Session[] {
    if (!sort) return sessions;
    const sorted = [...sessions].sort((sessionA, sessionB) =>
        compareValues(
            getSortValue(sessionA, sort.column, siteById, cycleById),
            getSortValue(sessionB, sort.column, siteById, cycleById),
        ),
    );
    return sort.direction === 'desc' ? sorted.reverse() : sorted;
}
