import {
    type PostResetPasswordRequestBody,
    type PostResetPasswordSuccessPayload,
} from '@/api/auth/validation/post-reset-password-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

type PostResetPasswordResult = Result<
    PostResetPasswordSuccessPayload,
    NetworkError
>;

type PostResetPasswordMutationOptions = Omit<
    UseMutationOptions<
        PostResetPasswordResult,
        NetworkError,
        PostResetPasswordRequestBody
    >,
    'mutationFn'
>;

async function postResetPassword(
    requestBody: PostResetPasswordRequestBody,
): Promise<PostResetPasswordResult> {
    const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
    });

    return response.json();
}

export function usePostResetPassword(
    options?: PostResetPasswordMutationOptions,
) {
    return useMutation({
        mutationFn: postResetPassword,
        ...options,
    });
}
