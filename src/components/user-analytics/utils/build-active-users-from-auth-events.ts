import { isAfter, isBefore, parseISO } from 'date-fns';
import type { AuthEvent } from '@/api/user/validation/auth-event-schema';
import type { UserSummary } from '@/api/user/validation/user-summary-schema';

export interface ActiveUser {
    userId: number;
    name: string | null;
    email: string;
    lastLoginAt: string;
    isNew: boolean;
}

const LAST_ACTIVE_EVENT_TYPES: ReadonlySet<AuthEvent['eventType']> = new Set([
    'login',
    'signup',
    'token_refresh',
]);

export function buildActiveUsersFromAuthEvents(
    authEvents: AuthEvent[],
    users: UserSummary[],
    viewerProgramId: number,
    windowStart: Date,
): ActiveUser[] {
    const usersById = new Map(users.map(user => [user.id, user]));

    const lastLoginAtByUserId = new Map<number, string>();
    for (const event of authEvents) {
        if (!LAST_ACTIVE_EVENT_TYPES.has(event.eventType)) continue;
        if (isBefore(parseISO(event.createdAt), windowStart)) continue;

        const currentLastLoginAt = lastLoginAtByUserId.get(event.userId);
        if (
            !currentLastLoginAt ||
            isAfter(parseISO(event.createdAt), parseISO(currentLastLoginAt))
        ) {
            lastLoginAtByUserId.set(event.userId, event.createdAt);
        }
    }

    const activeUsers: ActiveUser[] = [];
    for (const [userId, lastLoginAt] of lastLoginAtByUserId) {
        const user = usersById.get(userId);
        if (!user || user.programId !== viewerProgramId) continue;

        activeUsers.push({
            userId,
            name: user.name,
            email: user.email,
            lastLoginAt,
            isNew: !isBefore(parseISO(user.createdAt), windowStart),
        });
    }

    return activeUsers;
}
