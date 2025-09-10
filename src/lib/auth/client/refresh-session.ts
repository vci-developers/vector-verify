import { bff } from '@/lib/http/client';

export async function refreshSession(): Promise<true> {
  await bff<{ message: string }>('auth/refresh', { method: 'POST' });
  return true as const
}
