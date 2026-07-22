import { useEffect, useState, useCallback } from 'react';

const COOLDOWN_SECONDS = 60;

export function useResendCooldown(storageKey: string) {
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    const getStoredTimestamp = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;
        const rawTime = window.localStorage.getItem(storageKey);
        if (!rawTime) return null;
        const parsed = Number(rawTime);
        return Number.isFinite(parsed) ? parsed : null;
    }, [storageKey]);

    useEffect(() => {
        function tick() {
            const timestamp = getStoredTimestamp();
            if (!timestamp) {
                setSecondsRemaining(0);
                return;
            }
            const elapsed = (Date.now() - timestamp) / 1000;
            const remaining = Math.ceil(COOLDOWN_SECONDS - elapsed);
            setSecondsRemaining(Math.max(remaining, 0));
        }
        tick();
        const id = setInterval(tick, 1000);
        return () => clearInterval(id);
    }, [getStoredTimestamp]);

    const startCooldown = useCallback(() => {
        window.localStorage.setItem(storageKey, String(Date.now()));
        setSecondsRemaining(COOLDOWN_SECONDS);
    }, [storageKey]);

    return {
        secondsRemaining,
        isOnCooldown: secondsRemaining > 0,
        startCooldown,
    };
}

export function clearResendCooldown(storageKey: string) {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(storageKey);
}
