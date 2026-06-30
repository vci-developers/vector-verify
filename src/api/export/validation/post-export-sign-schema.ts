import { z } from 'zod';

export const postExportSignRequestBodySchema = z.object({
    path: z.string(),
});

export const postExportSignResponseSchema = z.object({
    url: z.url(),
    expiresAt: z.number(),
});

export type PostExportSignRequestBody = z.infer<
    typeof postExportSignRequestBodySchema
>;

export type PostExportSignResponseBody = z.infer<
    typeof postExportSignResponseSchema
>;
export type PostExportSignSuccessPayload = PostExportSignResponseBody;
