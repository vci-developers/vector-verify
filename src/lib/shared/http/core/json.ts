import { MEDIA_TYPE } from './media-types';

const BASE_JSON_HEADERS = {
  'content-type': MEDIA_TYPE.JSON,
  accept: MEDIA_TYPE.JSON,
} as const;

export function createJsonHeaders(): HeadersInit {
  return { ...BASE_JSON_HEADERS } satisfies HeadersInit;
}

export function createJsonRequestInit(payload: unknown): Pick<RequestInit, 'headers' | 'body'> {
  return {
    headers: createJsonHeaders(),
    body: JSON.stringify(payload),
  };
}
