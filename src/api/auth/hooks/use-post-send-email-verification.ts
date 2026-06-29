import { type PostSendEmailVerificationSuccessPayload } from '@/api/auth/validation/post-send-email-verification-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';
import { useMutation, type UseMutationOptions } from '@tanstack/react-query';

type PostSendEmailVerificationResult = Result<
    PostSendEmailVerificationSuccessPayload,
    NetworkError
>;

type PostSendEmailVerificationMutationOptions = Omit<
    UseMutationOptions<PostSendEmailVerificationResult, NetworkError>,
    'mutationfn'
>;

async function postSendEmailVerification(): Promise<PostSendEmailVerificationResult> {
    const response = await fetch('/api/auth/verification-email', {
        method: 'POST',
        credentials: 'include',
    });

    return response.json();
}

export function usePostSendEmailVerification(
    options?: PostSendEmailVerificationMutationOptions,
) {
    return useMutation({
        mutationFn: postSendEmailVerification,
        ...options,
    });
}
