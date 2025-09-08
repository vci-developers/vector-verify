export async function refreshSession(): Promise<void> {
  const response = await fetch('/api/bff/auth/refresh', {
    method: 'POST',
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) {
    throw new Error('Session refresh failed');
  }
}
