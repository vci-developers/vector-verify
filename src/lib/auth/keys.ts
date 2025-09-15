import type { QueryKey } from '@tanstack/react-query';

export const authKeys = {
  root: ['auth'] as const,
  refreshTimer: () => [...authKeys.root, 'refresh-timer'] as const,
};
export type AuthRefreshTimerQueryKey = ReturnType<
  typeof authKeys.refreshTimer
> &
  QueryKey;
