import { compareAsc, isAfter, parseISO } from 'date-fns';
import type { AuthEvent } from '@/api/user/validation/auth-event-schema';
import type { UserSummary } from '@/api/user/validation/user-summary-schema';

export interface ActiveUser {
    userId: number;
    name: string | null;
    email: string;
    lastActiveAt: string;
    isNew: boolean;
}

export function buildActiveUsersFromAuthEvents(
    loginEvents: AuthEvent[],
    users: UserSummary[],
    viewerProgramId: number,
    windowStartDate: string,
): ActiveUser[] {
    const windowStart = parseISO(windowStartDate);
    const usersById = new Map(users.map(user => [user.id, user]));

    const lastActiveAtByUserId = new Map<number, string>();
    for (const event of loginEvents) {
        const currentLastActiveAt = lastActiveAtByUserId.get(event.userId);
        if (
            !currentLastActiveAt ||
            isAfter(parseISO(event.createdAt), parseISO(currentLastActiveAt))
        ) {
            lastActiveAtByUserId.set(event.userId, event.createdAt);
        }
    }

    const activeUsers: ActiveUser[] = [];
    for (const [userId, lastActiveAt] of lastActiveAtByUserId) {
        const user = usersById.get(userId);
        if (!user || user.programId !== viewerProgramId) continue;

        activeUsers.push({
            userId,
            name: user.name,
            email: user.email,
            lastActiveAt,
            isNew: compareAsc(parseISO(user.createdAt), windowStart) >= 0,
        });
    }

    return activeUsers;
}
