import { z } from 'zod';

export const refreshRequestSchema = z.object({
    refreshToken: z.string().min(1),
});

export const refreshResponseSchema = z.object({
    message: z.string(),
    accessToken: z.string(),
});

export type RefreshRequestBody = z.infer<typeof refreshRequestSchema>;
export type RefreshResponseBody = z.infer<typeof refreshResponseSchema>;

export type RefreshSuccessPayload = Pick<RefreshResponseBody, 'message'>;
