import { z } from 'zod';

export const postResourcesSignRequestBodySchema = z.object({
    path: z.string(),
});

export const postResourcesSignResponseSchema = z.object({
    url: z.url(),
    expiresAt: z.number(),
});

export type PostResourcesSignRequestBody = z.infer<
    typeof postResourcesSignRequestBodySchema
>;

export type PostResourcesSignResponseBody = z.infer<
    typeof postResourcesSignResponseSchema
>;
export type PostResourcesSignSuccessPayload = PostResourcesSignResponseBody;
