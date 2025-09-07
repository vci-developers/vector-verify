import { useEffect } from 'react';

/**
 * Schedules proactive refresh ~30 minutes before access token expiry.
 * Assumes access token lifetime of 24h. Adjust if backend changes.
 */
const ACCESS_TOKEN_LIFETIME_MS = 31 * 60 * 1000; // 31min
const REFRESH_BUFFER_MS = 30 * 60 * 1000; // 30min

async function callRefreshEndpoint(): Promise<void> {
  const response = await fetch('/api/bff/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Session refresh failed');
  }
}

/**
 * Hook to be mounted once globally (e.g., in Providers).
 */
export function useSessionRefresh() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    async function schedule() {
      try {
        await callRefreshEndpoint();
        timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS);
      } catch (error) {
        console.error('Proactive session refresh failed', error);
      }
    }

    // initial schedule
    timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - REFRESH_BUFFER_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, []);
}
