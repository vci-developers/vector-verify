import { getUserProfile } from '@/api/user/get-user-profile';
import type { GetUserProfileResponseBody } from '@/api/user/validation/get-user-profile-schema';
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

    const getUserProfileResult: Result<
        GetUserProfileResponseBody,
        NetworkError
    > = await getUserProfile(accessToken);

    if (!getUserProfileResult.ok) {
        return NextResponse.json(err(getUserProfileResult), {
            status: getUserProfileResult.error.status ?? 400,
        });
    }

    return NextResponse.json(ok(getUserProfileResult.data), {
        status: 200,
    });
}
