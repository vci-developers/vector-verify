import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
} from '@/api/session/validation/session-schema';

export const putSessionRequestSchema = z.object({
    collectorName: z.string().optional(),
    collectorTitle: z.string().optional(),
    collectionMethod: z.string().optional(),
    state: sessionStateSchema.optional(),
});

export const putSessionResponseSchema = z.object({
    message: z.string(),
    session: sessionSchema,
});

export type PutSessionRequestBody = z.infer<typeof putSessionRequestSchema>;
export type PutSessionResponseBody = z.infer<typeof putSessionResponseSchema>;
export type PutSessionSuccessPayload = PutSessionResponseBody;
