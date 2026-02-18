import { z } from 'zod';

export const refreshRequestSchema = z.object({
    refreshToken: z.string().min(1),
});

export const refreshResponseSchema = z.object({
    message: z.string(),
    accessToken: z.string(),
});

export type RefreshNetworkRequestBody = z.infer<typeof refreshRequestSchema>;
export type RefreshNetworkResponseBody = z.infer<typeof refreshResponseSchema>;

export type RefreshNetworkSuccessPayload = Pick<
    RefreshNetworkResponseBody,
    'message'
>;
