export type QueryInput =
  | string
  | URLSearchParams
  | Record<string, string | number | boolean | null | undefined>;

function toURLSearchParams(query?: QueryInput): URLSearchParams | null {
  if (!query) return null;
  if (typeof query === 'string') return new URLSearchParams(query);
  if (query instanceof URLSearchParams) return query;
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value != null) {
      // Convert boolean to lowercase string to match standard query parameter format
      const stringValue = typeof value === 'boolean' ? String(value).toLowerCase() : String(value);
      params.set(key, stringValue);
    }
  }
  return params;
}

export function appendQuery(path: string, query?: QueryInput): string {
  const params = toURLSearchParams(query);
  const search = params?.toString() ?? '';
  return search ? `${path}${path.includes('?') ? '&' : '?'}${search}` : path;
}
