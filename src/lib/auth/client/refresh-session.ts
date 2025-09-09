import { bff } from '@/lib/http/client/bff-client';

export async function refreshSession(): Promise<void> {
  await bff<{ message: string }>('auth/refresh', { method: 'POST' });
}
