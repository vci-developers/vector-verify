import { useEffect, useState, useCallback } from 'react';

const COOLDOWN_SECONDS = 60;
const EMAIL_TYPES = ['emailVerification', 'forgotPassword'] as const;
type EmailCooldownType = (typeof EMAIL_TYPES)[number];

function getCooldownKey(cooldownType: EmailCooldownType) {
    return `auth.${cooldownType}LastSent`;
}

export function useResendCooldown(cooldownType: EmailCooldownType) {
    const key = getCooldownKey(cooldownType);
    const [secondsRemaining, setSecondsRemaining] = useState(0);

    const getStoredTimestamp = useCallback((): number | null => {
        if (typeof window === 'undefined') return null;
        const rawTime = window.localStorage.getItem(key);
        if (!rawTime) return null;
        const parsed = Number(rawTime);
        return Number.isFinite(parsed) ? parsed : null;
    }, [key]);

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
        window.localStorage.setItem(key, String(Date.now()));
        setSecondsRemaining(COOLDOWN_SECONDS);
    }, [key]);

    return {
        secondsRemaining,
        isOnCooldown: secondsRemaining > 0,
        startCooldown,
    };
}

export function clearSendEmailCooldown() {
    if (typeof window === 'undefined') return;
    EMAIL_TYPES.forEach(type => {
        window.localStorage.removeItem(getCooldownKey(type));
    });
}
