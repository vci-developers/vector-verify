import type { ErrorResponseDto } from '@/lib/dto/error';

export async function parseApiError(response: Response): Promise<string> {
  try {
    const contentType = response.headers.get('content-type') ?? '';
    if (contentType.includes('application/json')) {
      const body = (await response.json()) as Partial<ErrorResponseDto>;
      if (typeof body?.error === 'string' && body.error.trim().length > 0) {
        return body.error;
      }
      return 'Unexpected error shape from server.';
    }
    const text = (await response.text()).trim();
    return text || response.statusText || `HTTP ${response.status}`;
  } catch {
    return response.statusText || `HTTP ${response.status}`;
  }
}
