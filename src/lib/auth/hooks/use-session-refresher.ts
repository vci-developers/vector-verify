'use client';

import { useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { refreshSession } from '@/lib/auth/client/refresh-session';
import { logoutAction } from '@/lib/auth/actions';
import { COOKIE_AGE } from '@/lib/auth/cookies/constants';
import { authKeys, type AuthRefreshTimerQueryKey } from '@/lib/auth/keys';

const ACCESS_MS = COOKIE_AGE.ACCESS * 1000;
const BUFFER_MS = 30 * 60 * 1000;
const INTERVAL_MS = Math.max(30_000, ACCESS_MS - BUFFER_MS);

export function useSessionRefresherQuery(
  opts: { enabled?: boolean; suppressToast?: boolean } = {},
) {
  const { enabled = true, suppressToast = false } = opts;
  const router = useRouter();

  const { isError, isFetching } = useQuery({
    queryKey: authKeys.refreshTimer() as AuthRefreshTimerQueryKey,
    queryFn: refreshSession,
    enabled,
    retry: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchInterval: INTERVAL_MS,
    refetchIntervalInBackground: true,
    meta: { suppressErrorToast: suppressToast },
  });

  useEffect(() => {
    if (!isError || isFetching) return;
    (async () => {
      try {
        await logoutAction();
      } finally {
        router.push('/login');
      }
    })();
  }, [isError, isFetching, router]);
}
