export function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  const exclude = new Set([
    'host',
    'connection',
    'content-length',
    'cookie',
    'authorization',
    'transfer-encoding',
    'accept-encoding',
  ]);
  request.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!exclude.has(lower)) {
      headers.set(key, value);
    }
  });
  if (!headers.has('accept')) headers.set('accept', 'application/json');
  return headers;
}

export function forwardResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  const exclude = new Set([
    'transfer-encoding',
    'content-encoding',
    'content-length',
  ]);
  response.headers.forEach((value, key) => {
    const lower = key.toLowerCase();
    if (!exclude.has(lower)) {
      headers.set(key, value);
    }
  });
  return headers;
}
