export type FetchWithTimeoutInit = RequestInit & { timeoutMs?: number };

export const DEFAULT_FETCH_TIMEOUT_MS = 3000; 

export async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: FetchWithTimeoutInit = {},
): Promise<Response> {
  const { timeoutMs = DEFAULT_FETCH_TIMEOUT_MS, signal, ...rest } = init;
  const controller = new AbortController();

  if (signal) {
    if (signal.aborted) controller.abort();
    else signal.addEventListener('abort', () => controller.abort(), { once: true });
  }

  const hasTimeout = timeoutMs > 0;
  const timer = hasTimeout ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    return await fetch(input, { ...rest, signal: controller.signal });
  } finally {
    if (timer) clearTimeout(timer);
  }
}
