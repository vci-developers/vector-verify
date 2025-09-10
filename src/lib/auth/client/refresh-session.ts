import { bff } from '@/lib/shared/http/client';

export async function refreshSession(): Promise<true> {
  await bff<{ message: string }>('auth/refresh', { method: 'POST' });
  return true as const;
}
