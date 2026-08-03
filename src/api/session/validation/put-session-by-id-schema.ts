import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
} from '@/api/session/validation/session-schema';

export const putSessionByIdRequestSchema = z
    .object({
        state: sessionStateSchema,
        collectionCycleId: z.number().nullable(),
    })
    .partial()
    .refine(
        requestBody =>
            requestBody.state !== undefined ||
            requestBody.collectionCycleId !== undefined,
        { message: 'Either state or collectionCycleId must be provided' },
    );

export const putSessionByIdResponseSchema = z.object({
    message: z.string(),
    session: sessionSchema,
});

export type PutSessionByIdRequestBody = z.infer<
    typeof putSessionByIdRequestSchema
>;
export type PutSessionByIdResponseBody = z.infer<
    typeof putSessionByIdResponseSchema
>;
export type PutSessionByIdSuccessPayload = PutSessionByIdResponseBody;
