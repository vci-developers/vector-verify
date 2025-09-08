import { useEffect } from 'react';
import { refreshSession } from '../client/refresh-session';
import { COOKIE_AGE } from '../cookies/constants';

const ACCESS_TOKEN_LIFETIME_MS = COOKIE_AGE.ACCESS * 1000;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 30 * 1000; 

export function useSessionRefresh() {
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    async function schedule() {
      try {
        await refreshSession();
        timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - ACCESS_TOKEN_REFRESH_BUFFER_MS);
      } catch (error) {
        console.error('Proactive session refresh failed', error);
      }
    }

    timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - ACCESS_TOKEN_REFRESH_BUFFER_MS);
    return () => clearTimeout(timeout);
  }, []);
}
