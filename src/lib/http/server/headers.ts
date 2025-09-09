export function forwardRequestHeaders(request: Request): Headers {
  const headers = new Headers();
  request.headers.forEach((value, key) => {
    if (
      [
        'host',
        'connection',
        'content-length',
        'cookie',
        'authorization',
        'transfer-encoding',
        'accept-encoding',
      ].includes(key.toLowerCase())
    )
      return;
    headers.set(key, value);
  });
  return headers;
}

export function forwardResponseHeaders(response: Response): Headers {
  const headers = new Headers();
  response.headers.forEach((value, key) => {
    if (['transfer-encoding', 'content-encoding', 'content-length'].includes(key.toLowerCase())) {
      return;
    }
    headers.set(key, value);
  });
  return headers;
}

