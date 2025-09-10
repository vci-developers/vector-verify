import { bff } from '@/lib/http/client/bff-client';

export async function refreshSession(): Promise<true> {
  await bff<{ message: string }>('auth/refresh', { method: 'POST' });
  return true as const
}
