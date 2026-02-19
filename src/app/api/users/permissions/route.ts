import { getUserPermissions } from '@/api/user/get-user-permissions';
import type { GetUserPermissionsResponseBody } from '@/api/user/validation/get-user-permissions-schema';
import { ACCESS_COOKIE_NAME } from '@/features/auth_new/lib/cookies';
import type { NetworkError } from '@/lib/network/network-error';
import { err, ok, type Result } from '@/lib/result/result';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET() {
    const accessToken = (await cookies()).get(ACCESS_COOKIE_NAME)?.value;
    if (!accessToken) {
        const sessionExpiredErrorResult = err({
            kind: 'unauthorized',
            status: 401,
            message: 'Please sign in again',
        });
        return NextResponse.json(sessionExpiredErrorResult, { status: 401 });
    }

    const getUserPermissionsResult: Result<
        GetUserPermissionsResponseBody,
        NetworkError
    > = await getUserPermissions(accessToken);

    if (!getUserPermissionsResult.ok) {
        return NextResponse.json(getUserPermissionsResult, {
            status: getUserPermissionsResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getUserPermissionsResult.data), {
        status: 200,
    });
}
