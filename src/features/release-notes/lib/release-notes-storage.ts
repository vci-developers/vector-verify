export function hasSeenRelease(releaseId: string): boolean {
    try {
        return (
            window.localStorage.getItem(`release-notes-seen:${releaseId}`) ===
            'true'
        );
    } catch {
        return false;
    }
}

export function markReleaseSeen(releaseId: string): void {
    try {
        window.localStorage.setItem(`release-notes-seen:${releaseId}`, 'true');
    } catch {
        // Persistence is optional; unavailable storage must not prevent dismissal.
    }
}
