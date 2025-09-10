import { useEffect, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { refreshSession } from '../client/refresh-session';
import { COOKIE_AGE } from '../cookies/constants';
import { logoutAction } from '@/lib/auth/actions';

const ACCESS_TOKEN_LIFETIME_MS = COOKIE_AGE.ACCESS * 1000;
const ACCESS_TOKEN_REFRESH_BUFFER_MS = 60 * 30 * 1000;

export function useSessionRefresh() {
  const router = useRouter();
  const [, startTransition] = useTransition();
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;

    async function schedule() {
      try {
        await refreshSession();
        timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - ACCESS_TOKEN_REFRESH_BUFFER_MS);
      } catch {
        startTransition(async () => {
          try {
            await logoutAction();
          } catch {}
          router.push('/login');
          router.refresh();
        });
      }
    }

    timeout = setTimeout(schedule, ACCESS_TOKEN_LIFETIME_MS - ACCESS_TOKEN_REFRESH_BUFFER_MS);
    return () => clearTimeout(timeout);
  }, [router, startTransition]);
}
