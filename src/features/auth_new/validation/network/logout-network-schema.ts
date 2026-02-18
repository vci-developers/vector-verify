import { z } from 'zod';

export const logoutResponseSchema = z.object({
    message: z.string(),
});

export type LogoutNetworkResponseBody = z.infer<typeof logoutResponseSchema>;
export type LogoutNetworkSuccessPayload = LogoutNetworkResponseBody;
