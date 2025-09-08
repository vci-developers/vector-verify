import { ENV } from '@/lib/config/env';

export type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

export function buildUpstreamUrl(path: string, query?: QueryInput) {
  const base = ENV.API_BASE_URL.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  let search = '';

  if (query) {
    if (typeof query === 'string') {
      search = query ? (query.startsWith('?') ? query : `?${query}`) : '';
    } else {
      const params =
        query instanceof URLSearchParams
          ? query
          : new URLSearchParams(
              Object.entries(query)
                .filter(([, value]) => value !== undefined && value !== null)
                .map(([key, value]) => [key, String(value)]),
            );
      const queryString = params.toString();
      search = queryString ? `?${queryString}` : '';
    }
  }

  return `${base}/${cleanPath}${search}`;
}
