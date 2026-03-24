import { z } from 'zod';
import {
    sessionSchema,
    sessionStateSchema,
} from '@/api/session/validation/session-schema';

export const updateSessionRequestSchema = z.object({
    state: sessionStateSchema,
});

export const updateSessionResponseSchema = z.object({
    message: z.string(),
    session: sessionSchema,
});

export type UpdateSessionRequestBody = z.infer<
    typeof updateSessionRequestSchema
>;
export type UpdateSessionResponseBody = z.infer<
    typeof updateSessionResponseSchema
>;
export type UpdateSessionSuccessPayload = UpdateSessionResponseBody;
