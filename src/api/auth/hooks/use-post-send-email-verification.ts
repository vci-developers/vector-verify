import { type PostSendEmailVerificationSuccessPayload } from '@/api/auth/validation/post-send-email-verification-schema';
import type { NetworkError } from '@/lib/network/network-error';
import type { Result } from '@/lib/result/result';

type PostSendEmailVerificationResult = Result<
    PostSendEmailVerificationSuccessPayload,
    NetworkError
>;

export async function UsePostSendVerificationEmail(): Promise<PostSendEmailVerificationResult> {
    const response = await fetch('/api/auth/verification-email', {
        method: 'POST',
        credentials: 'include',
    });

    const postSendEmailVerificationResult: PostSendEmailVerificationResult =
        await response.json();
    return postSendEmailVerificationResult;
}
