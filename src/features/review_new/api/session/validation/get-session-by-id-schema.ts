import { z } from 'zod';
import { sessionSchema } from '@/features/review_new/api/session/validation/session-schema';

export const getSessionByIdSchema = sessionSchema;

export type GetSessionByIdResponseBody = z.infer<typeof getSessionByIdSchema>;

export type GetSessionByIdSuccessPayload = GetSessionByIdResponseBody;
