import type { Session } from '@/api/session/validation/session-schema';

export function matchesSearch(
    session: Session,
    siteName: string,
    search: string,
): boolean {
    if (!search) return true;
    const needle = search.toLowerCase();
    return (
        String(session.sessionId).includes(needle) ||
        siteName.toLowerCase().includes(needle)
    );
}
