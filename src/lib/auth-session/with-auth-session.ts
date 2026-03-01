import 'server-only';

import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { ACCESS_COOKIE_NAME } from './cookies';

export async function withAuthSession<T>(
    callback: (accessToken: string) => Promise<Result<T, NetworkError>>,
): Promise<Result<T, NetworkError>> {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        return err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
    }

    return callback(accessToken);
}
