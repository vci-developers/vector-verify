import "server-only";

export const API_BASE_URL = "https://api.vectorcam.org/";

type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type QueryValue = string | number | boolean | Array<string | number | boolean>;
type QueryParameters = Record<string, QueryValue | null | undefined>;

type ApiRequestOptions = {
  method: HttpMethod;
  body?: unknown;
  query?: QueryParameters;
  auth?: { token?: string | null };
  headers?: Record<string, string>;
  timeoutMs?: number;
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
};

function constructUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedBase = API_BASE_URL.endsWith("/")
    ? API_BASE_URL.slice(0, -1)
    : API_BASE_URL;
  return path.startsWith("/")
    ? `${normalizedBase}${path}`
    : `${normalizedBase}/${path}`;
}

function appendQueryParameters(
  urlString: string,
  query?: QueryParameters
): string {
  const url = new URL(urlString);
  if (query) {
    for (const [key, value] of Object.entries(query)) {
      if (value === undefined || value === null) continue;
      if (Array.isArray(value))
        value.forEach((item) => url.searchParams.append(key, String(item)));
      else url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function isFormDataRequestBody(body: unknown): body is FormData {
  return typeof FormData !== "undefined" && body instanceof FormData;
}

function isJsonResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return contentType.includes("application/json");
}

function isBinaryResponse(response: Response): boolean {
  const contentType = response.headers.get("content-type") ?? "";
  return (
    contentType.startsWith("application/octet-stream") ||
    contentType.startsWith("image/") ||
    contentType.startsWith("application/pdf")
  );
}

export async function apiRequest<T>(
  path: string,
  { method, body, query, auth, headers, timeoutMs = 30_000, cache, next }: ApiRequestOptions
): Promise<T> {
  const absoluteUrl = appendQueryParameters(constructUrl(path), query);

  const requestHeaders = new Headers(headers);
  let requestBody: BodyInit | undefined;

  if (method !== "GET" && body !== undefined) {
    if (isFormDataRequestBody(body)) {
      requestBody = body;
    } else {
      requestHeaders.set("Content-Type", "application/json");
      requestBody = JSON.stringify(body);
    }
  }

  if (auth?.token) requestHeaders.set("Authorization", `Bearer ${auth.token}`);

  const abortController = new AbortController();
  const timeoutHandle = setTimeout(() => abortController.abort(), timeoutMs);

  const useNext = method === "GET" ? next : undefined;
  const cacheSettings = cache ?? (useNext ? "force-cache" : "no-store");

  let response: Response;
  try {
    response = await fetch(absoluteUrl, {
      method,
      headers: requestHeaders,
      body: requestBody,
      cache: cacheSettings,
      next: useNext,
      signal: abortController.signal,
    });
  } catch (error: any) {
    if (error?.name === "AbortError") {
      throw new Error(`Request timed out after ${timeoutMs}ms at ${path}`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutHandle);
  }

  if (response.status === 204 || response.status === 205) {
    return undefined as unknown as T;
  }

  if (isBinaryResponse(response)) {
    const blob = await response.blob();
    if (!response.ok)
      throw new Error(
        `API ${response.status} ${response.statusText} at ${path}`
      );
    return blob as unknown as T;
  }

  const responseText = await response.text().catch(() => "");

  if (!response.ok) {
    throw new Error(
      `API ${response.status} ${response.statusText} at ${path}${
        responseText ? ` - ${responseText}` : ""
      }`
    );
  }

  if (!responseText) {
    return undefined as unknown as T;
  }

  if (isJsonResponse(response)) {
    try {
      return JSON.parse(responseText) as T;
    } catch {
      throw new Error(`Invalid JSON from ${path}`);
    }
  }

  return responseText as unknown as T;
}
