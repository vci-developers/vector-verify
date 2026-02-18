export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const onSuccess = <T, E>(result: Result<T, E>, fn: (data: T) => void) => {
    if (result.ok) fn(result.data);
    return result
}

export const onError = <T, E>(result: Result<T, E>, fn: (error: E) => void) => {
    if (!result.ok) fn(result.error);
    return result
}
