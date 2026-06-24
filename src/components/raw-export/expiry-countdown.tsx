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
    const [remainingMs, setRemainingMs] = useState(
        Math.max(0, expiresAt - Date.now()),
    );

    useEffect(() => {
        function tick() {
            const remaining = Math.max(0, expiresAt - Date.now());
            setRemainingMs(remaining);
            if (remaining <= 0) onExpire();
        }

        tick();
        const intervalId = setInterval(tick, 1000);
        return () => clearInterval(intervalId);
    }, [expiresAt, onExpire]);

    const totalSeconds = Math.ceil(remainingMs / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;

    return (
        <p className="text-muted-foreground text-xs">
            Link expires in {minutes}:{seconds.toString().padStart(2, '0')}
        </p>
    );
}
