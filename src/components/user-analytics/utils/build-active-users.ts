import { isBefore, parseISO } from 'date-fns';
import type { UserSummary } from '@/api/user/validation/user-summary-schema';

export interface ActiveUser {
    userId: number;
    name: string | null;
    email: string;
    lastActiveAt: string;
    isNew: boolean;
}

export function buildActiveUsers(
    users: UserSummary[],
    windowStart: Date,
): ActiveUser[] {
    const activeUsers: ActiveUser[] = [];

    for (const user of users) {
        if (!user.lastActiveAt) continue;
        if (isBefore(parseISO(user.lastActiveAt), windowStart)) continue;

        activeUsers.push({
            userId: user.id,
            name: user.name,
            email: user.email,
            lastActiveAt: user.lastActiveAt,
            isNew: !isBefore(parseISO(user.createdAt), windowStart),
        });
    }

    return activeUsers;
}
