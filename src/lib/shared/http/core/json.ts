const BASE_JSON_HEADERS = {
  'content-type': 'application/json',
  accept: 'application/json',
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
