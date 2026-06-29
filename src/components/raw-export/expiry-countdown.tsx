'use client';

import { useEffect, useState } from 'react';

interface ExpiryCountdownProps {
    expiresAt: number;
    onExpire: () => void;
}

export default function ExpiryCountdown({
    expiresAt,
    onExpire,
}: ExpiryCountdownProps) {
    const expiresAtMs = expiresAt * 1000;
    const [remainingMs, setRemainingMs] = useState(
        Math.max(0, expiresAtMs - Date.now()),
    );

    useEffect(() => {
        function tick() {
            const remainingTime = Math.max(0, expiresAtMs - Date.now());
            setRemainingMs(remainingTime);
            if (remainingTime <= 0) onExpire();
        }

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [expiresAtMs, onExpire]);

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        <p className="text-muted-foreground text-xs">
            Link expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
    );
}
