import type { QueryKey } from '@tanstack/react-query';

export const authKeys = {
  root: ['auth'] as const,
  session: () => [...authKeys.root, 'session'] as const,
};

export type AuthSessionQueryKey = ReturnType<typeof authKeys.session> & QueryKey;

