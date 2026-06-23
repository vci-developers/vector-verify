import { z } from 'zod';

export const verificationEmailResponseSchema = z.object({
    message: z.string(),
});

export type VerificationEmailResponseBody = z.infer<
    typeof verificationEmailResponseSchema
>;

export type VerificationEmailSuccessPayload = VerificationEmailResponseBody;
