import { postForgotPassword } from '@/api/auth/post-forgot-password';
import {
    type PostForgotPasswordRequestBody,
    type PostForgotPasswordResponseBody,
} from '@/api/auth/validation/post-forgot-password-schema';
import type { NetworkError } from '@/lib/network/network-error';
import { err, type Result } from '@/lib/result/result';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
    let requestBody: PostForgotPasswordRequestBody;
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
    const postForgotPasswordResult: Result<
        PostForgotPasswordResponseBody,
        NetworkError
    > = await postForgotPassword(requestBody);

    return NextResponse.json(postForgotPasswordResult, {
        status: postForgotPasswordResult.ok
            ? 200
            : (postForgotPasswordResult.error.status ?? 400),
    });
}
