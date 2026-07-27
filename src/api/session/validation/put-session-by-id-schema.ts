import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
} from '@/api/session/validation/session-schema';

export const putSessionByIdRequestSchema = z.object({
    state: sessionStateSchema.optional(),
    collectionCycleId: z.number().nullable().optional(),
});

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
