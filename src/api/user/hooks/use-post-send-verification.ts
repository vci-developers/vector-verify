import { type PostSendVerificationSuccessPayload } from '@/api/user/validation/post-send-verification-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

type PostSendVerificationResult = Result<
    PostSendVerificationSuccessPayload,
    NetworkError
>;

type PostSendVerificationMutationOptions = Omit<
    UseMutationOptions<PostSendVerificationResult, NetworkError>,
    'mutationFn'
>;

async function postSendVerification(): Promise<PostSendVerificationResult> {
    const response = await fetch('/api/users/send-verification', {
        method: 'POST',
        credentials: 'include',
    });

    return response.json();
}

export function usePostSendVerification(
    options?: PostSendVerificationMutationOptions,
) {
    return useMutation({
        mutationFn: postSendVerification,
        ...options,
    });
}
