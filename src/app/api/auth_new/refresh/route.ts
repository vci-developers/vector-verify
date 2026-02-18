import { refresh } from '@/features/auth_new/api/refresh';
import { setAccessCookie } from '@/features/auth_new/lib/cookies';
import type {
    RefreshNetworkRequestBody,
    RefreshNetworkResponseBody,
    RefreshNetworkSuccessPayload,
} from '@/features/auth_new/validation/network/refresh-network-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
    const refreshToken = (await cookies()).get('refreshToken')?.value;

    if (!refreshToken) {
        const requestBodyErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(requestBodyErrorResult, { status: 401 });
    }

    const requestBody: RefreshNetworkRequestBody = { refreshToken };
    const refreshResult: Result<RefreshNetworkResponseBody, NetworkError> =
        await refresh(requestBody);
    if (!refreshResult.ok) {
        return NextResponse.json(refreshResult, {
            status: refreshResult.error.status ?? 401,
        });
    }

    const successPayload: RefreshNetworkSuccessPayload = {
        message: refreshResult.data.message,
    };

    const response = NextResponse.json(ok(successPayload), { status: 200 });

    setAccessCookie(response, refreshResult.data.accessToken);
    return response;
}
