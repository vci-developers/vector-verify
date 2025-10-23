import type { ErrorResponseDto } from '@/shared/dto/error';
import { MEDIA_TYPE } from './media-types';

export interface ParsedApiError {
  status: number;
  message: string;
  body?: unknown;
  contentType?: string | null;
}

export async function parseApiErrorResponse(
  response: Response,
): Promise<ParsedApiError> {
  const status = response.status;
  const contentType = response.headers.get('content-type');

  try {
    if (contentType?.toLowerCase().includes(MEDIA_TYPE.JSON)) {
      const body = (await response.json()) as Partial<ErrorResponseDto>;
      const message =
        typeof body?.error === 'string' && body.error.trim().length > 0
          ? body.error
          : 'Unexpected error shape from server.';
      return { status, message, body, contentType };
    }

    const text = (await response.text()).trim();
    const message = text || response.statusText || `HTTP ${status}`;
    return { status, message, body: text, contentType };
  } catch {
    const fallback = response.statusText || `HTTP ${status}`;
    return { status, message: fallback, contentType };
  }
}
