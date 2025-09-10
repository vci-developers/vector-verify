export interface RouteErrorOptions {
  message: string;
  status?: number;
}

function sanitizeMessage(message: string, max = 300): string {
  const clean = message.replace(/<[^>]*>/g, '').trim();
  return clean.length > max ? `${clean.slice(0, max)}…` : clean;
}

export function buildErrorParams(input: RouteErrorOptions | string): URLSearchParams {
  const { message, status } =
    typeof input === 'string' ? { message: input, status: undefined } : input;
  const params = new URLSearchParams();
  params.set('error', sanitizeMessage(message));
  if (typeof status === 'number' && Number.isFinite(status)) {
    params.set('status', String(status));
  }
  return params;
}

export function withRouteError(href: string, input: RouteErrorOptions | string): string {
  try {
    const url = new URL(href, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    const params = buildErrorParams(input);
    params.forEach((value, key) => url.searchParams.set(key, value));
    return url.pathname + (url.search ? url.search : '');
  } catch {
    // Fallback if URL construction fails; append raw query
    const params = buildErrorParams(input).toString();
    const sep = href.includes('?') ? '&' : '?';
    return `${href}${sep}${params}`;
  }
}
