import { postResetPassword } from '@/api/auth/post-reset-password';
import {
    type PostResetPasswordRequestBody,
    type PostResetPasswordResponseBody,
} from '@/api/auth/validation/post-reset-password-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: PostResetPasswordRequestBody;
    try {
        requestBody = await request.json();
    } catch {
        const requestBodyErrorResult = err({
            kind: 'client',
            status: 400,
            message: 'Invalid JSON body',
        });
        return NextResponse.json(requestBodyErrorResult, { status: 400 });
    }
    const postResetPasswordResult: Result<
        PostResetPasswordResponseBody,
        NetworkError
    > = await postResetPassword(requestBody);

    return NextResponse.json(postResetPasswordResult, {
        status: postResetPasswordResult.ok
            ? 200
            : (postResetPasswordResult.error.status ?? 400),
    });
}
