import { getUserProfile } from '@/api/user/get-user-profile';
import type { GetUserProfileResponseBody } from '@/api/user/validation/get-user-profile-schema';
import { NextResponse } from 'next/server';
import { withAuthSession } from '@/lib/auth-session/with-auth-session';

export async function GET() {
    const authorizedGetUserProfileResult =
        await withAuthSession<GetUserProfileResponseBody>(getUserProfile);

    return NextResponse.json(authorizedGetUserProfileResult, {
        status: authorizedGetUserProfileResult.ok
            ? 200
            : (authorizedGetUserProfileResult.error.status ?? 400),
    });
}
