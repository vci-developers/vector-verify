'use client';

import { useSessionRefresh } from '@/lib/auth/hooks/use-session-refresh';

export function SessionRefreshMount() {
  useSessionRefresh();
  return null;
}

