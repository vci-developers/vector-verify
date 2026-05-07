import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const resolveConflictRequestSchema = z.object({
    sessionIds: z.array(z.number()),
    resolvedData: sessionSchema,
    resolvedSurveillanceForm: z.record(z.string(), z.unknown()).nullable(),
});

export const resolveConflictResponseSchema = z.object({
    message: z.string(),
    resolutionId: z.number(),
    updatedSessionCount: z.number(),
});

export type ResolveConflictRequestBody = z.infer<
    typeof resolveConflictRequestSchema
>;
export type ResolveConflictResponseBody = z.infer<
    typeof resolveConflictResponseSchema
>;
export type ResolveConflictSuccessPayload = ResolveConflictResponseBody;
