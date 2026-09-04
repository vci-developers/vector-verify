import type { ActiveUser } from '@/components/user-analytics/utils/build-active-users-from-auth-events';

export function matchesActiveUserSearch(
    activeUser: ActiveUser,
    search: string,
): boolean {
    if (!search) return true;
    const needle = search.toLowerCase();
    return (
        (activeUser.name?.toLowerCase().includes(needle) ?? false) ||
        activeUser.email.toLowerCase().includes(needle)
    );
}
