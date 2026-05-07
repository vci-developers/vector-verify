import { z } from 'zod';
import { sessionSchema } from '@/api/session/validation/session-schema';

export const resolveSessionConflictsRequestSchema = z.object({
    sessionIds: z.array(z.number()),
    resolvedData: sessionSchema,
    resolvedSurveillanceForm: z.record(z.string(), z.unknown()).nullable(),
});

export const resolveSessionConflictsResponseSchema = z.object({
    message: z.string(),
    resolutionId: z.number(),
    updatedSessionCount: z.number(),
});

export type ResolveSessionConflictsRequestBody = z.infer<
    typeof resolveSessionConflictsRequestSchema
>;
export type ResolveSessionConflictsResponseBody = z.infer<
    typeof resolveSessionConflictsResponseSchema
>;
export type ResolveSessionConflictsSuccessPayload =
    ResolveSessionConflictsResponseBody;
