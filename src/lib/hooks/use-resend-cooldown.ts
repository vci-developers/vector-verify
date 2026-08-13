import { useEffect, useState, useCallback } from 'react';

const COOLDOWN_SECONDS = 60;
const VERIFICATION_EMAIL_COOLDOWN_KEY = 'auth.verificationEmaillastSent';

export function useResendCooldown() {
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    const getStoredTimestamp = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;
        const rawTime = window.localStorage.getItem(
            VERIFICATION_EMAIL_COOLDOWN_KEY,
        );
        if (!rawTime) return null;
        const parsed = Number(rawTime);
        return Number.isFinite(parsed) ? parsed : null;
    }, []);

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
        window.localStorage.setItem(
            VERIFICATION_EMAIL_COOLDOWN_KEY,
            String(Date.now()),
        );
        setSecondsRemaining(COOLDOWN_SECONDS);
    }, []);

    return {
        secondsRemaining,
        isOnCooldown: secondsRemaining > 0,
        startCooldown,
    };
}

export function clearVerificationEmailCooldown() {
    if (typeof window === 'undefined') return;
    window.localStorage.removeItem(VERIFICATION_EMAIL_COOLDOWN_KEY);
}
