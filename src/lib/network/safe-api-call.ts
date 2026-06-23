import 'server-only';

import type z from 'zod';
import { err, ok, type Result } from '@/lib/result/result';
import {
    statusToNetworkErrorKind,
    type NetworkError,
} from '@/lib/network/network-error';
import { constructUrl } from '@/lib/network/construct-url';
import { backendErrorSchema } from '@/lib/network/validation/backend-error-schema';

async function readJson(response: Response): Promise<unknown | null> {
    try {
        return await response.json();
    } catch {
        return null;
    }
}

export async function safeApiCall<T>(
    path: string,
    options?: RequestInit,
    validationSchema?: z.ZodType<T>,
): Promise<Result<T, NetworkError>> {
    const method = options?.method?.toUpperCase() ?? 'GET';
    const needsBody = ['POST', 'PUT', 'PATCH'].includes(method);
    const body = needsBody ? (options?.body ?? '{}') : options?.body;
    let response: Response;
    try {
        response = await fetch(constructUrl(path), {
            ...options,
            body,
            cache: 'no-cache',
            headers: {
                'Content-Type': 'application/json',
                ...(options?.headers || {}),
            },
        });
    } catch (error) {
        const message = error instanceof Error ? error.message : undefined;
        return err({ kind: 'network', message });
    }

    const responseBody = await readJson(response);

    if (!response.ok) {
        const parsedError = backendErrorSchema.safeParse(responseBody);
        return err({
            kind: statusToNetworkErrorKind(response.status),
            status: response.status,
            message: parsedError.success ? parsedError.data.error : undefined,
        });
    }

    if (validationSchema) {
        const parsedData = validationSchema.safeParse(responseBody);
        if (!parsedData.success) return err({ kind: 'client' });
        return ok(parsedData.data);
    }

    return ok(responseBody as T);
}
