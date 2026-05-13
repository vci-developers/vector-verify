import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const getSessionByIdResponseSchema = sessionSchema;

export type GetSessionByIdResponseBody = z.infer<
    typeof getSessionByIdResponseSchema
>;

export type GetSessionByIdSuccessPayload = GetSessionByIdResponseBody;
