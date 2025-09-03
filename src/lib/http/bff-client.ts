import { ErrorResponseDto } from '../dto/error';

export async function bff<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api/bff/${path.replace(/^\/+/, '')}`, {
    ...init,
    credentials: 'include',
    cache: 'no-store',
  });

  const contentType = response.headers.get('content-type') ?? '';
  if (!response.ok) {
    const { error } = (await response.json()) as ErrorResponseDto;
    throw new Error(error);
  }

  if (
    response.status === 204 ||
    response.status === 205 ||
    response.headers.get('content-length') === '0'
  ) {
    return undefined as T;
  }

  if (contentType.includes('application/json')) {
    return (await response.json()) as T;
  }

  const text = await response.text();
  return text as unknown as T;
}
