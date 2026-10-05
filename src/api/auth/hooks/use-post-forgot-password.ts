import {
    type PostForgotPasswordRequestBody,
    type PostForgotPasswordSuccessPayload,
} from '@/api/auth/validation/post-forgot-password-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

type PostForgotPasswordResult = Result<
    PostForgotPasswordSuccessPayload,
    NetworkError
>;

type PostForgotPasswordMutationOptions = Omit<
    UseMutationOptions<
        PostForgotPasswordResult,
        NetworkError,
        PostForgotPasswordRequestBody
    >,
    'mutationFn'
>;

async function postForgotPassword(
    requestBody: PostForgotPasswordRequestBody,
): Promise<PostForgotPasswordResult> {
    const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    return response.json();
}

export function usePostForgotPassword(
    options?: PostForgotPasswordMutationOptions,
) {
    return useMutation({
        mutationFn: postForgotPassword,
        ...options,
    });
}
