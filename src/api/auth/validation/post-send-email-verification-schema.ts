import { z } from 'zod';

export const postSendEmailVerificationResponseSchema = z.object({
    message: z.string(),
});

export type PostSendEmailVerificationResponseBody = z.infer<
    typeof postSendEmailVerificationResponseSchema
>;

export type PostSendEmailVerificationSuccessPayload =
    PostSendEmailVerificationResponseBody;
