import { z } from 'zod';

export const postSendVerificationResponseSchema = z.object({
    message: z.string(),
});

export type PostSendVerificationResponseBody = z.infer<
    typeof postSendVerificationResponseSchema
>;

export type PostSendVerificationSuccessPayload =
    PostSendVerificationResponseBody;
