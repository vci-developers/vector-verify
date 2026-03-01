export type Result<T, E> = { ok: true; data: T } | { ok: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({ ok: true, data });
export const err = <E>(error: E): Result<never, E> => ({ ok: false, error });

export const onSuccess = <T, E>(
    result: Result<T, E>,
    callback: (data: T) => void,
) => {
    if (result.ok) callback(result.data);
    return result;
};

export const onError = <T, E>(
    result: Result<T, E>,
    callback: (error: E) => void,
) => {
    if (!result.ok) callback(result.error);
    return result;
};
